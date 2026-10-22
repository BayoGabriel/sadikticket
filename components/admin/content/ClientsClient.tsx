"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ImagePicker } from "@/components/admin/ui/ImagePicker";
import { useToast } from "@/components/admin/ui/Toast";

export type ClientRow = {
  id: string;
  name: string;
  engagement: string;
  description: string;
  photo: string;
  logo: string;
  quote: string;
  approvalConfirmed: boolean;
  order: number;
  published: boolean;
};

const emptyClient = (): ClientRow => ({
  id: "", name: "", engagement: "", description: "", photo: "", logo: "",
  quote: "", approvalConfirmed: false, order: 0, published: true,
});

export function ClientsClient({ initial }: { initial: ClientRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ClientRow | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/clients", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await fetch("/api/v1/admin/content/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  };

  const save = async () => {
    if (!editing) return;
    if (editing.quote && !editing.approvalConfirmed) {
      toast("Tick “client approved this quote” — we only publish words they've signed off.", { error: true });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(editing.id ? `/api/v1/admin/content/clients/${editing.id}` : "/api/v1/admin/content/clients", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      toast("Saved — the Business page is updated.");
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: ClientRow) => {
    setItems(items.map((i) => (i === item ? { ...i, published: !i.published } : i)));
    const res = await fetch(`/api/v1/admin/content/clients/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    } else {
      toast(item.published ? "Hidden from the Business page." : "Live on the Business page.", {
        actionLabel: "Undo",
        onAction: () => void togglePublished({ ...item, published: item.published }),
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/v1/admin/content/clients/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Removed.");
      setDeleting(null);
      await refresh();
    } else toast("Couldn't delete — try again.", { error: true });
  };

  return (
    <div className="mt-5">
      {items.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No client stories yet"
          body="Add the companies you've worked with — logos and project cards appear on the Business page."
          actionLabel="Add a client"
          onAction={() => setEditing(emptyClient())}
        />
      ) : (
        <div className="a-card divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
              {items.length} client{items.length === 1 ? "" : "s"}
            </p>
            <button type="button" onClick={() => setEditing(emptyClient())} className="a-btn a-btn-orange a-btn-sm">
              <Icon name="plus" size={14} /> Add a client
            </button>
          </div>
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => void move(i, -1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronUp" size={14} />
                </button>
                <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => void move(i, 1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              <div className="flex h-10 w-16 flex-none items-center justify-center overflow-hidden rounded-lg" style={{ background: "var(--mint)" }}>
                {item.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.logo} alt="" className="max-h-8 max-w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold" style={{ color: "var(--green)" }}>{item.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{item.name}</span>
                  {!item.published && <span className="a-chip a-chip-dashed">Hidden</span>}
                  {item.quote && !item.approvalConfirmed && <span className="a-chip a-chip-amber">Quote not approved</span>}
                </div>
                <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  {item.engagement || "—"} · {item.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Toggle checked={item.published} onChange={() => void togglePublished(item)} label={item.published ? "Published" : "Hidden"} />
                <button type="button" onClick={() => setEditing({ ...item })} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`} className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }}>
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
        title={editing?.id ? `Edit — ${editing.name}` : "Add a client"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.name} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Client name" required>
              <input className="a-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Logo" hint="Shown in the logo strip. PNG or SVG with a transparent background looks best.">
              <ImagePicker value={editing.logo} folder="serenart/clients" onChange={(f) => setEditing({ ...editing, logo: f?.url ?? "" })} />
            </Field>
            <Field label="Type of engagement" hint="e.g. Team bonding day, End-of-year party">
              <input className="a-input" value={editing.engagement} onChange={(e) => setEditing({ ...editing, engagement: e.target.value })} />
            </Field>
            <Field label="What we did">
              <textarea className="a-input min-h-20" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label="Project photo">
              <ImagePicker value={editing.photo} folder="serenart/clients" onChange={(f) => setEditing({ ...editing, photo: f?.url ?? "" })} />
            </Field>
            <Field label="Their words" hint="A quote from the client — verbatim.">
              <textarea className="a-input min-h-16" value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
            </Field>
            {editing.quote && (
              <Toggle
                checked={editing.approvalConfirmed}
                onChange={(v) => setEditing({ ...editing, approvalConfirmed: v })}
                label="The client approved this quote"
                hint="Required — we never publish someone's words without sign-off."
              />
            )}
            <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Show on the Business page" />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title={`Remove ${deleting?.name}?`}
        body="Their logo and story leave the Business page."
        confirmLabel="Remove"
      />
    </div>
  );
}
