"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ImagePicker } from "@/components/admin/ui/ImagePicker";
import { useToast } from "@/components/admin/ui/Toast";

export type ReviewRow = {
  id: string;
  name: string;
  context: string;
  kind: "guest" | "client";
  text: string;
  shortText: string;
  photo: string;
  source: string;
  permissionConfirmed: boolean;
  featured: boolean;
  approved: boolean;
  company: string;
  role: string;
};

const SOURCES = [
  { value: "written", label: "Written" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "verbal", label: "Said out loud" },
  { value: "other", label: "Other" },
];

const emptyReview = (): ReviewRow => ({
  id: "", name: "", context: "", kind: "guest", text: "", shortText: "",
  photo: "", source: "written", permissionConfirmed: false,
  featured: false, approved: false, company: "", role: "",
});

export function ReviewsClient({ initial }: { initial: ReviewRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ReviewRow | null>(null);
  const [tab, setTab] = useState<"guest" | "client">("guest");

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/reviews", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
  };

  const visible = items.filter((i) => i.kind === tab);
  const featuredCount = items.filter((i) => i.featured && i.approved && i.permissionConfirmed).length;

  const save = async () => {
    if (!editing) return;
    if (editing.approved && !editing.permissionConfirmed) {
      toast("Tick “guest confirmed we can share this” before publishing.", { error: true });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing.id ? `/api/v1/admin/reviews/${editing.id}` : "/api/v1/admin/reviews", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      toast("Saved.");
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const patch = async (item: ReviewRow, body: Partial<ReviewRow>, undoLabel: string) => {
    setItems(items.map((i) => (i.id === item.id ? { ...i, ...body } : i)));
    const res = await fetch(`/api/v1/admin/reviews/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    } else {
      toast(undoLabel, { actionLabel: "Undo", onAction: () => void patch({ ...item, ...body }, { approved: item.approved, featured: item.featured } as Partial<ReviewRow>, "Undone.") });
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const ids = visible.map((v) => v.id);
    const a = ids[index], b = ids[index + dir];
    if (!b) return;
    const ia = next.findIndex((x) => x.id === a);
    const ib = next.findIndex((x) => x.id === b);
    [next[ia], next[ib]] = [next[ib], next[ia]];
    setItems(next);
    await fetch("/api/v1/admin/reviews", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/v1/admin/reviews/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Deleted.");
      setDeleting(null);
      await refresh();
    } else toast("Couldn't delete — try again.", { error: true });
  };

  return (
    <div className="mt-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["guest", "client"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`a-chip ${tab === t ? "a-chip-green" : "a-chip-grey"}`}
            style={{ cursor: "pointer" }}
          >
            {t === "guest" ? "Guest reviews" : "Business / client"}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "var(--admin-ink-soft)" }}>
          {featuredCount}/3 featured on the homepage
        </span>
        <button type="button" onClick={() => setEditing({ ...emptyReview(), kind: tab })} className="a-btn a-btn-orange a-btn-sm">
          <Icon name="plus" size={14} /> Add a review
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="star"
          title={tab === "guest" ? "No guest reviews yet" : "No client reviews yet"}
          body="When someone says something lovely, add it here — with their permission. Only approved, permission-confirmed reviews show on the site."
          actionLabel="Add a review"
          onAction={() => setEditing({ ...emptyReview(), kind: tab })}
        />
      ) : (
        <div className="a-card divide-y">
          {visible.map((item, i) => (
            <div key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className="flex flex-col pt-1">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => void move(i, -1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronUp" size={14} />
                </button>
                <button type="button" aria-label="Move down" disabled={i === visible.length - 1} onClick={() => void move(i, 1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              {item.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{item.name}</span>
                  {item.context && <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>· {item.context}</span>}
                  <span className="a-chip a-chip-grey">{SOURCES.find((s) => s.value === item.source)?.label ?? item.source}</span>
                  {item.featured && <span className="a-chip a-chip-orange">Featured</span>}
                  {!item.permissionConfirmed && <span className="a-chip a-chip-amber">No permission yet</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--admin-ink)" }}>
                  “{item.shortText || item.text}”
                </p>
              </div>
              <div className="flex flex-none flex-col items-end gap-2 sm:flex-row sm:items-center">
                <Toggle
                  checked={item.approved}
                  onChange={(v) => {
                    if (v && !item.permissionConfirmed) {
                      toast("Confirm their permission first — open the review and tick the box.", { error: true });
                      return;
                    }
                    void patch(item, { approved: v }, v ? "Live on the site." : "Hidden from the site.");
                  }}
                  label={item.approved ? "Live" : "Hidden"}
                />
                <Toggle
                  checked={item.featured}
                  onChange={(v) => void patch(item, { featured: v }, v ? "Featured on homepage." : "Unfeatured.")}
                  label="Featured"
                />
                <button type="button" onClick={() => setEditing({ ...item })} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                <button type="button" onClick={() => setDeleting(item)} aria-label="Delete" className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit review" : "Add a review"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.name || !editing?.text} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["guest", "client"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setEditing({ ...editing, kind: k })}
                  className={`a-chip ${editing.kind === k ? "a-chip-green" : "a-chip-grey"}`}
                  style={{ cursor: "pointer" }}
                >
                  {k === "guest" ? "Guest" : "Business / client"}
                </button>
              ))}
            </div>
            <Field label={editing.kind === "guest" ? "First name" : "Reviewer name"} required>
              <input className="a-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder={editing.kind === "guest" ? "e.g. Ada" : "e.g. Chidi Okafor"} />
            </Field>
            {editing.kind === "client" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company">
                  <input className="a-input" value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} />
                </Field>
                <Field label="Role">
                  <input className="a-input" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                </Field>
              </div>
            )}
            <Field label="Event or occasion" hint="e.g. Sip and Paint Night, Dangote team day">
              <input className="a-input" value={editing.context} onChange={(e) => setEditing({ ...editing, context: e.target.value })} />
            </Field>
            <Field label="Their words" required hint="Exactly as they said it — don't tidy up their grammar.">
              <textarea className="a-input min-h-24" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
            </Field>
            <Field label="Short version (optional)" hint="Used on the homepage if the full quote is long.">
              <textarea className="a-input min-h-14" value={editing.shortText} onChange={(e) => setEditing({ ...editing, shortText: e.target.value })} />
            </Field>
            <Field label="Where it came from">
              <select className="a-input" value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })}>
                {SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Screenshot / photo" hint="A WhatsApp or Instagram screenshot keeps it provable.">
              <ImagePicker value={editing.photo} folder="serenart/reviews" onChange={(f) => setEditing({ ...editing, photo: f?.url ?? "" })} />
            </Field>
            <Toggle
              checked={editing.permissionConfirmed}
              onChange={(v) => setEditing({ ...editing, permissionConfirmed: v })}
              label="They confirmed we can share this"
              hint="Required before the review can go live."
            />
            <Toggle
              checked={editing.approved}
              onChange={(v) => setEditing({ ...editing, approved: v })}
              label="Publish on the site"
              hint={editing.permissionConfirmed ? "" : "Needs permission confirmed first."}
            />
            <Toggle checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} label="Feature on homepage" hint="Up to 3 featured reviews show on the homepage." />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title={`Delete ${deleting?.name}'s review?`}
        body="It's gone from everywhere — there's no undo."
        confirmLabel="Delete"
      />
    </div>
  );
}
