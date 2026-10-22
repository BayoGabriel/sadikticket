"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

export type PageRow = {
  key: string;
  title: string;
  path: string;
  content: string;
  lastUpdatedAt: string | null;
  versions: { content: string; savedBy: string; savedAt: string }[];
};

// Wraps the current selection in a tag pair. Plain-textarea rich text —
// only the tags the public renderer allows are offered.
function wrap(text: string, start: number, end: number, tag: string, block = false): [string, number, number] {
  const sel = text.slice(start, end) || (block ? "Text" : "text");
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const out = text.slice(0, start) + open + sel + close + text.slice(end);
  return [out, start + open.length, start + open.length + sel.length];
}

export function PagesClient({ initial }: { initial: PageRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<PageRow | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const applyTag = (tag: string, block = false) => {
    const el = areaRef.current;
    if (!el) return;
    const [next, s, e] = wrap(draft, el.selectionStart, el.selectionEnd, tag, block);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s, e);
    });
  };

  const insertLink = () => {
    const el = areaRef.current;
    if (!el) return;
    const url = window.prompt("Link to (https://… or /page)", "https://");
    if (!url) return;
    const [next, s, e] = wrap(draft, el.selectionStart, el.selectionEnd, `a href="${url}"`, false);
    void s; void e;
    setDraft(next);
  };

  const insertList = () => {
    const el = areaRef.current;
    if (!el) return;
    const sel = draft.slice(el.selectionStart, el.selectionEnd);
    const itemsHtml = sel
      ? sel.split("\n").filter(Boolean).map((l) => `  <li>${l}</li>`).join("\n")
      : "  <li>First point</li>\n  <li>Second point</li>";
    const block = `<ul>\n${itemsHtml}\n</ul>`;
    setDraft(draft.slice(0, el.selectionStart) + block + draft.slice(el.selectionEnd));
  };

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/pages", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setItems(data.data.items.map((p: PageRow & { lastUpdatedAt: string | null }) => ({
        ...p,
        lastUpdatedAt: p.lastUpdatedAt,
        versions: (p.versions ?? []).map((v: { content: string; savedBy?: string; savedAt: string }) => ({
          content: v.content,
          savedBy: v.savedBy ?? "",
          savedAt: new Date(v.savedAt).toISOString(),
        })),
      })));
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/content/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editing.key, content: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      toast(`Saved — ${editing.title} is live on the site.`);
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const restore = async (page: PageRow, content: string) => {
    const res = await fetch("/api/v1/admin/content/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: page.key, content }),
    });
    if (res.ok) {
      toast("Restored — the older version is live again.");
      setHistory(null);
      await refresh();
    } else toast("Couldn't restore — try again.", { error: true });
  };

  return (
    <div className="mt-5 space-y-3">
      {items.map((page) => (
        <div key={page.key} className="a-card flex flex-wrap items-center gap-3 px-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{page.title}</span>
              <a href={page.path} target="_blank" rel="noreferrer" className="text-xs font-semibold underline underline-offset-2" style={{ color: "var(--orange)" }}>
                {page.path}
              </a>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
              {page.content
                ? `Last updated ${page.lastUpdatedAt ? new Date(page.lastUpdatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "recently"}`
                : "Using the built-in text — edit to replace it."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {page.versions.length > 1 && (
              <button type="button" onClick={() => setHistory(page)} className="a-btn a-btn-ghost a-btn-sm">
                History ({page.versions.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => { setEditing(page); setDraft(page.content || "<h2>Heading</h2>\n<p>Your text here.</p>"); setPreview(false); }}
              className="a-btn a-btn-orange a-btn-sm"
            >
              Edit
            </button>
          </div>
        </div>
      ))}

      {/* Editor */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing ? `Edit — ${editing.title}` : ""} width={720}>
        {editing && (
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => applyTag("h2", true)} className="a-btn a-btn-ghost a-btn-sm">H2</button>
              <button type="button" onClick={() => applyTag("h3", true)} className="a-btn a-btn-ghost a-btn-sm">H3</button>
              <button type="button" onClick={() => applyTag("strong")} className="a-btn a-btn-ghost a-btn-sm"><strong>B</strong></button>
              <button type="button" onClick={() => applyTag("em")} className="a-btn a-btn-ghost a-btn-sm"><em>I</em></button>
              <button type="button" onClick={insertLink} className="a-btn a-btn-ghost a-btn-sm">Link</button>
              <button type="button" onClick={insertList} className="a-btn a-btn-ghost a-btn-sm">List</button>
              <button type="button" onClick={() => setPreview(!preview)} className="a-btn a-btn-outline a-btn-sm ml-auto">
                {preview ? "Back to editing" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="rich-page rounded-xl p-5" style={{ border: "1px solid var(--admin-line)", background: "#fff" }}>
                <div dangerouslySetInnerHTML={{ __html: draft }} />
              </div>
            ) : (
              <textarea
                ref={areaRef}
                className="a-input min-h-72 font-mono text-xs leading-6"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
              />
            )}
            <p className="mt-2 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
              Only simple formatting is allowed — headings, bold, italic, links and lists — so the page always looks right.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
              <button type="button" onClick={() => void save()} disabled={saving} className="a-btn a-btn-orange">
                {saving ? "Saving…" : "Save & publish"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Version history */}
      <Modal open={!!history} onClose={() => setHistory(null)} title={history ? `History — ${history.title}` : ""} width={560}>
        {history && (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {history.versions.map((v, i) => (
              <div key={i} className="rounded-xl p-3" style={{ border: "1px solid var(--admin-line)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
                    {new Date(v.savedAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    {v.savedBy ? ` · ${v.savedBy}` : ""}
                    {i === 0 ? " · current" : ""}
                  </p>
                  {i > 0 && (
                    <button type="button" onClick={() => void restore(history, v.content)} className="a-btn a-btn-outline a-btn-sm">
                      Restore
                    </button>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  {v.content.replace(/<[^>]+>/g, " ").slice(0, 140)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
