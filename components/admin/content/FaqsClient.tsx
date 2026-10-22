"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ChipInput } from "@/components/admin/ui/ChipInput";
import { useToast } from "@/components/admin/ui/Toast";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  topics: string[];
  showOnEventPages: boolean;
  priority: number;
  published: boolean;
  needsAnswer?: boolean;
};

const emptyFaq = (): FaqRow => ({
  id: "",
  question: "",
  answer: "",
  category: "General",
  topics: [],
  showOnEventPages: true,
  priority: 0,
  published: true,
});

export function FaqsClient({ initial }: { initial: FaqRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<FaqRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<FaqRow | null>(null);
  const unseeded = items.some((i) => !i.id);
  const needing = items.filter((i) => i.needsAnswer).length;

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/faqs", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items.map((d: FaqRow & { _id?: string }) => ({ ...d, id: d.id || String(d._id) })));
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

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await fetch("/api/v1/admin/content/faqs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id).filter(Boolean) }),
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(editing.id ? `/api/v1/admin/content/faqs/${editing.id}` : "/api/v1/admin/content/faqs", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      toast("Saved — it's live on the site.");
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: FaqRow, field: "published" | "showOnEventPages") => {
    setItems(items.map((i) => (i === item ? { ...i, [field]: !i[field] } : i)));
    const res = await fetch(`/api/v1/admin/content/faqs/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !item[field] }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/v1/admin/content/faqs/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Question removed.");
      setDeleting(null);
      await refresh();
    } else toast("Couldn't delete — try again.", { error: true });
  };

  return (
    <div className="mt-5">
      {unseeded && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--light-peach)", border: "1px solid var(--peach)" }}>
          <span className="flex-1">These are the starter questions. Load them into the database to edit them.</span>
          <button type="button" onClick={() => void seed()} disabled={saving} className="a-btn a-btn-orange a-btn-sm">
            {saving ? "Loading…" : "Load starter content"}
          </button>
        </div>
      )}
      {needing > 0 && (
        <p className="mb-4 text-sm" style={{ color: "var(--admin-amber)" }}>
          {needing} answer{needing === 1 ? "" : "s"} still say{needing === 1 ? "s" : ""} “[Your policy.]” — fill {needing === 1 ? "it" : "them"} in before launch.
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon="help"
          title="No questions yet"
          body="Add the things guests ask most — they show on the FAQs page and event pages."
          actionLabel="New question"
          onAction={() => setEditing(emptyFaq())}
        />
      ) : (
        <div className="a-card divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
              {items.length} question{items.length === 1 ? "" : "s"}
            </p>
            <button type="button" onClick={() => setEditing(emptyFaq())} className="a-btn a-btn-orange a-btn-sm">
              <Icon name="plus" size={14} /> New question
            </button>
          </div>
          {items.map((item, i) => (
            <div key={item.id || item.question} className="flex items-start gap-3 px-4 py-3">
              <div className="flex flex-col pt-1">
                <button type="button" aria-label="Move up" disabled={i === 0 || unseeded} onClick={() => void move(i, -1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronUp" size={14} />
                </button>
                <button type="button" aria-label="Move down" disabled={i === items.length - 1 || unseeded} onClick={() => void move(i, 1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{item.question}</span>
                  {item.needsAnswer && <span className="a-chip a-chip-amber">Needs your answer</span>}
                  {!item.published && <span className="a-chip a-chip-dashed">Hidden</span>}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{item.answer}</p>
              </div>
              <div className="flex flex-none items-center gap-1.5">
                {item.id ? (
                  <>
                    <button type="button" onClick={() => setEditing({ ...item })} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                    <button type="button" onClick={() => setDeleting(item)} aria-label="Delete" className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }}>
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
        title={editing?.id ? "Edit question" : "New question"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.question || !editing?.answer} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Question" required>
              <input className="a-input" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
            </Field>
            <Field label="Answer" required hint={/\[your/i.test(editing.answer) ? "Still has a [Your policy.] placeholder — replace it with the real answer." : "Plain words, like you'd say it out loud."}>
              <textarea className="a-input min-h-32" value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
            </Field>
            <Field label="Category">
              <input className="a-input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </Field>
            <Field label="Related topics" hint="Matched against event tags — 'painting' FAQs show on painting events.">
              <ChipInput value={editing.topics} onChange={(v) => setEditing({ ...editing, topics: v })} placeholder="e.g. painting" />
            </Field>
            <Field label="Priority on event pages" hint="Higher numbers win when an event page picks its 3 questions.">
              <input type="number" className="a-input w-28" value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: Number(e.target.value) || 0 })} />
            </Field>
            <Toggle checked={editing.showOnEventPages} onChange={(v) => setEditing({ ...editing, showOnEventPages: v })} label="Can appear on event pages" />
            <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Show on the FAQs page" />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title="Delete this question?"
        body="It disappears from the FAQs page and every event page."
        confirmLabel="Delete"
      />
    </div>
  );
}
