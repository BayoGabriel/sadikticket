"use client";

import { useState } from "react";
import { ImagePicker } from "@/components/admin/ui/ImagePicker";
import { useToast } from "@/components/admin/ui/Toast";

export type SiteCopyField = {
  key: string;
  group: string;
  label: string;
  kind: "text" | "longtext" | "image";
  default: string;
  value: string;
  edited: boolean;
};

export function SiteCopyClient({ initial }: { initial: SiteCopyField[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const groups = items.reduce<Record<string, SiteCopyField[]>>((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});

  const current = (f: SiteCopyField) =>
    drafts[f.key] ?? (f.edited ? f.value : f.default);

  const save = async (f: SiteCopyField) => {
    const value = drafts[f.key];
    if (value === undefined) return;
    setBusy(f.key);
    try {
      const res = await fetch("/api/v1/admin/content/site-copy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: f.key, value: value === f.default ? null : value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      setItems((xs) =>
        xs.map((x) =>
          x.key === f.key
            ? { ...x, value: value === f.default ? "" : value, edited: value !== f.default }
            : x,
        ),
      );
      setDrafts((d) => {
        const n = { ...d };
        delete n[f.key];
        return n;
      });
      toast(value === f.default ? "Reset to default." : "Saved — live on the site.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setBusy(null);
    }
  };

  const reset = async (f: SiteCopyField) => {
    setBusy(f.key);
    try {
      await fetch("/api/v1/admin/content/site-copy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: f.key, value: null }),
      });
      setItems((xs) => xs.map((x) => (x.key === f.key ? { ...x, value: "", edited: false } : x)));
      setDrafts((d) => ({ ...d, [f.key]: f.default }));
      toast("Reset to default.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-5 space-y-6">
      {Object.entries(groups).map(([group, fields]) => (
        <section key={group} className="a-card">
          <h2 className="border-b px-4 py-3 text-sm font-bold" style={{ borderColor: "var(--admin-line)" }}>
            {group}
          </h2>
          <div className="divide-y">
            {fields.map((f) => (
              <div key={f.key} className="px-4 py-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="a-label !mb-0">{f.label}</span>
                  {f.edited && <span className="a-chip a-chip-green">Edited</span>}
                </div>
                {f.kind === "image" ? (
                  <div className="max-w-xs">
                    <ImagePicker
                      value={current(f)}
                      folder="serenart/site"
                      label="Upload photo"
                      onChange={(file) => {
                        setDrafts((d) => ({ ...d, [f.key]: file?.url ?? "" }));
                        // Images save immediately — no separate save click.
                        void (async () => {
                          setBusy(f.key);
                          const res = await fetch("/api/v1/admin/content/site-copy", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ key: f.key, value: file?.url ?? null }),
                          });
                          setBusy(null);
                          if (res.ok) {
                            setItems((xs) =>
                              xs.map((x) =>
                                x.key === f.key ? { ...x, value: file?.url ?? "", edited: Boolean(file?.url) } : x,
                              ),
                            );
                            toast(file ? "Photo updated." : "Photo removed — back to default.");
                          } else toast("Couldn't save — try again.", { error: true });
                        })();
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    {f.kind === "longtext" ? (
                      <textarea
                        className="a-textarea flex-1"
                        value={current(f)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [f.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        className="a-input flex-1"
                        value={current(f)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [f.key]: e.target.value }))}
                      />
                    )}
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        disabled={busy === f.key || drafts[f.key] === undefined || drafts[f.key] === (f.edited ? f.value : f.default)}
                        onClick={() => void save(f)}
                        className="a-btn a-btn-orange a-btn-sm"
                      >
                        Save
                      </button>
                      {f.edited && (
                        <button type="button" disabled={busy === f.key} onClick={() => void reset(f)} className="a-btn a-btn-ghost a-btn-sm">
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
