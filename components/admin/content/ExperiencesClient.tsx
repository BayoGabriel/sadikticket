"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ChipInput } from "@/components/admin/ui/ChipInput";
import { ImagePicker } from "@/components/admin/ui/ImagePicker";
import { useToast } from "@/components/admin/ui/Toast";
import type { AdminExperience } from "@/services/contentService";

const CATEGORIES = [
  { value: "creative", label: "Creative" },
  { value: "social", label: "Social" },
  { value: "outdoor", label: "Outdoor" },
] as const;

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const emptyDraft = (): AdminExperience => ({
  id: "",
  slug: "",
  name: "",
  category: "creative",
  oneLiner: "",
  heroImage: "",
  gallery: [],
  whatItIs: [],
  whatToExpect: [],
  whoItSuits: [],
  addons: [],
  eventTags: [],
  eventType: "",
  wide: false,
  published: true,
  order: 0,
});

export function ExperiencesClient({ initial }: { initial: AdminExperience[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<AdminExperience | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminExperience | null>(null);
  const unseeded = items.some((i) => !i.id);

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/experiences", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
    router.refresh();
  };

  const seed = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/content/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't load starter content.");
      toast(`Starter content loaded — ${data.data.seeded.join(", ") || "nothing new"}.`);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't load — try again.", { error: true });
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
    await fetch("/api/v1/admin/content/experiences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id).filter(Boolean) }),
    });
  };

  const togglePublished = async (item: AdminExperience) => {
    setItems(items.map((i) => (i === item ? { ...i, published: !i.published } : i)));
    const res = await fetch(`/api/v1/admin/content/experiences/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    } else {
      toast(item.published ? "Hidden from site." : "Live on site.", { actionLabel: "Undo", onAction: () => void togglePublished({ ...item, published: item.published }) });
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const body = {
        slug: editing.slug || slugify(editing.name),
        name: editing.name,
        category: editing.category,
        oneLiner: editing.oneLiner,
        heroImage: editing.heroImage,
        gallery: editing.gallery,
        whatItIs: editing.whatItIs.join("\n\n"),
        whatToExpect: editing.whatToExpect,
        whoItSuits: editing.whoItSuits,
        addOns: editing.addons,
        eventType: editing.eventType,
        eventTags: editing.eventTags,
        wide: editing.wide,
        order: editing.order,
        published: editing.published,
      };
      const res = await fetch(editing.id ? `/api/v1/admin/content/experiences/${editing.id}` : "/api/v1/admin/content/experiences", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save — check the fields.");
      toast(`Saved — "${editing.name}" is updated on the site.`);
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/v1/admin/content/experiences/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast(`Deleted — "${deleting.name}" is gone.`);
      setDeleting(null);
      await refresh();
    } catch {
      toast("Couldn't delete — try again.", { error: true });
    }
  };

  return (
    <div className="mt-5">
      {unseeded && (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm"
          style={{ background: "var(--light-peach)", border: "1px solid var(--peach)" }}
        >
          <span className="flex-1" style={{ color: "var(--admin-ink)" }}>
            These are the starter experiences from the brief. Load them into the
            database to edit them, reorder them or add your own.
          </span>
          <button type="button" onClick={seed} disabled={saving} className="a-btn a-btn-orange a-btn-sm">
            {saving ? "Loading…" : "Load starter content"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No experiences yet"
          body="Add the first one — it shows up on the site as soon as it's published."
          actionLabel="New experience"
          onAction={() => setEditing(emptyDraft())}
        />
      ) : (
        <div className="a-card divide-y" style={{ borderColor: "var(--admin-line)" }}>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
              {items.length} experience{items.length === 1 ? "" : "s"} — order shown on the site
            </p>
            <button type="button" onClick={() => setEditing(emptyDraft())} className="a-btn a-btn-orange a-btn-sm">
              <Icon name="plus" size={14} /> New experience
            </button>
          </div>
          {items.map((item, i) => (
            <div key={item.id || item.slug} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={i === 0 || unseeded}
                  onClick={() => void move(i, -1)}
                  className="rounded p-1 disabled:opacity-25 hover:bg-black/5"
                >
                  <Icon name="chevronUp" size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={i === items.length - 1 || unseeded}
                  onClick={() => void move(i, 1)}
                  className="rounded p-1 disabled:opacity-25 hover:bg-black/5"
                >
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              <div className="h-12 w-16 flex-none overflow-hidden rounded-lg" style={{ background: "var(--mint)" }}>
                {item.heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.heroImage} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{item.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: "var(--mint)", color: "var(--green)" }}
                  >
                    {item.category}
                  </span>
                  {!item.published && (
                    <span className="a-chip a-chip-dashed">Hidden</span>
                  )}
                </div>
                <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  /experiences/{item.slug} · {item.oneLiner || "No one-liner yet"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {item.id ? (
                  <>
                    <Toggle checked={item.published} onChange={() => void togglePublished(item)} label={item.published ? "Published" : "Hidden"} />
                    <button type="button" onClick={() => { setEditing({ ...item }); setDraft(item.whatItIs.join("\n\n")); }} className="a-btn a-btn-ghost a-btn-sm">
                      Edit
                    </button>
                    <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`} className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }}>
                      <Icon name="trash" size={15} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs italic" style={{ color: "var(--admin-ink-soft)" }}>Load starter content to edit</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit — ${editing.name}` : "New experience"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.name || !editing?.slug && !editing?.name} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Name" required>
              <input
                className="a-input"
                value={editing.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing({ ...editing, name, slug: editing.slug || slugify(name) });
                }}
              />
            </Field>
            <Field label="Link (slug)" hint={`/experiences/${editing.slug || "…"}`} required>
              <input
                className="a-input font-mono text-xs"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
              />
            </Field>
            <Field label="Category" required>
              <select
                className="a-input"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value as AdminExperience["category"] })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="One-liner" hint="The short line under the name on the card and page.">
              <input className="a-input" value={editing.oneLiner} maxLength={300} onChange={(e) => setEditing({ ...editing, oneLiner: e.target.value })} />
            </Field>
            <Field label="Main photo">
              <ImagePicker
                value={editing.heroImage}
                folder="serenart/experiences"
                onChange={(f) => setEditing({ ...editing, heroImage: f?.url ?? "" })}
              />
            </Field>
            <Field label="What it is" hint="Write it like you'd explain it to a friend. A blank line starts a new paragraph.">
              <textarea
                className="a-input min-h-28"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setEditing({ ...editing, whatItIs: e.target.value.split(/\n{2,}/).filter(Boolean) });
                }}
              />
            </Field>
            <Field label="What to expect on the day">
              <ChipInput value={editing.whatToExpect} onChange={(v) => setEditing({ ...editing, whatToExpect: v })} placeholder="e.g. All materials provided" />
            </Field>
            <Field label="Who it suits">
              <ChipInput value={editing.whoItSuits} onChange={(v) => setEditing({ ...editing, whoItSuits: v })} placeholder="e.g. Date night" />
            </Field>
            <Field label="Add-ons guests can ask for">
              <ChipInput value={editing.addons} onChange={(v) => setEditing({ ...editing, addons: v })} placeholder="e.g. Private host" />
            </Field>
            <Field label="Matching event tags" hint="Events with these tags show under “Upcoming … events” on this page.">
              <ChipInput value={editing.eventTags} onChange={(v) => setEditing({ ...editing, eventTags: v })} placeholder="e.g. painting" />
            </Field>
            <Field label="Event type match" hint="Exact eventType match — usually the slug.">
              <input className="a-input" value={editing.eventType} onChange={(e) => setEditing({ ...editing, eventType: e.target.value })} />
            </Field>
            <Toggle checked={!!editing.wide} onChange={(v) => setEditing({ ...editing, wide: v })} label="Wide card" hint="Spans a full row on the experiences page." />
            <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Show on the site" />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        title={`Delete “${deleting?.name}”?`}
        body="It disappears from the site straight away. You can add it back later, but its text will be gone."
        confirmLabel="Delete"
        requireText={deleting?.name}
      />
    </div>
  );
}
