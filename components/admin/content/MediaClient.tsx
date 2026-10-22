"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ChipInput } from "@/components/admin/ui/ChipInput";
import { useToast } from "@/components/admin/ui/Toast";

export type MediaRow = {
  id: string;
  kind: "photo" | "video";
  url: string;
  poster: string;
  publicId: string;
  alt: string;
  tags: string[];
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  featured: boolean;
  published: boolean;
  usedIn: string[];
};

const SUGGESTED_TAGS = ["painting", "karaoke", "picnic", "pottery", "private party", "team day"];

export function MediaClient({ initial, seeded }: { initial: MediaRow[]; seeded: boolean }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [deleting, setDeleting] = useState<MediaRow | null>(null);
  const [uploads, setUploads] = useState<{ name: string; done: boolean; error?: string }[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/media", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
  };

  const seed = async () => {
    setSaving(true);
    const res = await fetch("/api/v1/admin/content/seed", { method: "POST" });
    setSaving(false);
    if (res.ok) {
      toast("Starter content loaded.");
      await refresh();
    } else toast("Couldn't load — try again.", { error: true });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    setUploads(list.map((f) => ({ name: f.name, done: false })));
    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      try {
        const form = new FormData();
        form.append("file", f);
        form.append("folder", "serenart/gallery");
        const up = await fetch("/api/v1/admin/uploads", { method: "POST", body: form });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData?.error?.message || "Upload failed");
        const file = upData.data;
        const res = await fetch("/api/v1/admin/content/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: file.kind === "video" ? "video" : "photo",
            url: file.url,
            publicId: file.publicId,
            width: file.width,
            height: file.height,
            bytes: file.bytes,
            duration: file.duration,
            alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
            tags: [],
          }),
        });
        if (!res.ok) throw new Error("Saved upload failed");
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, done: true } : x)));
      } catch (e) {
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, error: e instanceof Error ? e.message : "Failed" } : x)));
      }
    }
    await refresh();
    setTimeout(() => setUploads([]), 4000);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/content/media/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editing.alt, tags: editing.tags, featured: editing.featured, published: editing.published, poster: editing.poster }),
      });
      if (!res.ok) throw new Error();
      toast("Saved.");
      setEditing(null);
      await refresh();
    } catch {
      toast("Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await fetch("/api/v1/admin/content/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/v1/admin/content/media/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Removed from the gallery.");
      setDeleting(null);
      await refresh();
    } else toast("Couldn't delete — try again.", { error: true });
  };

  const visible = tagFilter ? items.filter((i) => i.tags.includes(tagFilter)) : items;
  const allTags = Array.from(new Set(items.flatMap((i) => i.tags)));

  return (
    <div className="mt-5">
      {!seeded && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--light-peach)", border: "1px solid var(--peach)" }}>
          <span className="flex-1">The public gallery is showing its built-in placeholders. Load them here to manage them, then upload your real photos.</span>
          <button type="button" onClick={() => void seed()} disabled={saving} className="a-btn a-btn-orange a-btn-sm">
            {saving ? "Loading…" : "Load starter content"}
          </button>
        </div>
      )}

      {/* Upload dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files); }}
        className="a-card flex flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-8 text-center transition"
        style={dragOver ? { borderColor: "var(--orange)", background: "var(--light-peach)" } : {}}
      >
        <Icon name="upload" size={22} />
        <p className="text-sm font-semibold">Drop photos or short videos here</p>
        <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>JPG, PNG or WebP up to 15MB · MP4/WebM up to 100MB</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="a-btn a-btn-outline a-btn-sm mt-1">
          Browse files
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm" className="hidden" onChange={(e) => e.target.files?.length && void uploadFiles(e.target.files)} />
        {uploads.map((u, i) => (
          <p key={i} className="text-xs" style={{ color: u.error ? "var(--admin-red)" : u.done ? "var(--green)" : "var(--admin-ink-soft)" }}>
            {u.name} — {u.error ? u.error : u.done ? "uploaded" : "uploading…"}
          </p>
        ))}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTagFilter("")} className={`a-chip ${!tagFilter ? "a-chip-green" : "a-chip-grey"}`} style={{ cursor: "pointer" }}>
            All
          </button>
          {allTags.map((t) => (
            <button key={t} type="button" onClick={() => setTagFilter(tagFilter === t ? "" : t)} className={`a-chip ${tagFilter === t ? "a-chip-green" : "a-chip-grey"}`} style={{ cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon="image"
          title={tagFilter ? `Nothing tagged "${tagFilter}"` : "Nothing in the library yet"}
          body="Upload event photos — the best ones show on the public gallery."
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item, i) => (
            <div key={item.id} className="a-card group relative overflow-hidden p-0" style={{ borderRadius: "1rem" }}>
              <div className="relative aspect-[4/3]" style={{ background: "var(--mint)" }}>
                {(item.kind === "video" ? item.poster || item.url : item.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.kind === "video" ? item.poster || item.url : item.url} alt={item.alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Icon name="image" size={20} /></div>
                )}
                {item.kind === "video" && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Video</span>
                )}
                {item.featured && (
                  <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "var(--orange)", color: "#fff" }}>Featured</span>
                )}
                {!item.published && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-[10px] font-bold uppercase text-white">Hidden from site</span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold">{item.alt || "No caption"}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((t) => (
                    <span key={t} className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--mint)", color: "var(--green)" }}>{t}</span>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <button type="button" onClick={() => setEditing({ ...item })} className="a-btn a-btn-ghost a-btn-sm flex-1" style={{ justifyContent: "center" }}>Edit</button>
                  <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => void move(i, -1)} className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "0.3rem" }}>
                    <Icon name="chevronLeft" size={13} />
                  </button>
                  <button type="button" aria-label="Move right" disabled={i === visible.length - 1} onClick={() => void move(i, 1)} className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "0.3rem" }}>
                    <Icon name="chevronRight" size={13} />
                  </button>
                  <button type="button" aria-label="Delete" onClick={() => setDeleting(item)} className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "0.3rem", color: "var(--admin-red)" }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit media"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving} className="a-btn a-btn-orange">{saving ? "Saving…" : "Save"}</button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--admin-line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editing.kind === "video" ? editing.poster || editing.url : editing.url} alt="" className="w-full object-cover" style={{ maxHeight: 200 }} />
            </div>
            <Field label="Caption (alt text)" hint="Describes the photo for screen readers and shows under it in the lightbox.">
              <input className="a-input" value={editing.alt} onChange={(e) => setEditing({ ...editing, alt: e.target.value })} />
            </Field>
            <Field label="Tags" hint={`Suggested: ${SUGGESTED_TAGS.join(", ")}`}>
              <ChipInput value={editing.tags} onChange={(v) => setEditing({ ...editing, tags: v })} placeholder="e.g. painting" />
            </Field>
            {editing.kind === "video" && (
              <Field label="Poster image URL" hint="Shown before the video plays.">
                <input className="a-input" value={editing.poster} onChange={(e) => setEditing({ ...editing, poster: e.target.value })} />
              </Field>
            )}
            <Toggle checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Featured" hint="Best-of pick for homepage strips." />
            <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Show on the site" />
            {editing.usedIn?.length > 0 && (
              <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                Also used in: {editing.usedIn.join(", ")}
              </p>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title="Delete this media?"
        body={
          deleting?.usedIn?.length
            ? `Careful — it's used in: ${deleting.usedIn.join(", ")}. Deleting leaves those spots empty.`
            : "It leaves the public gallery straight away."
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
