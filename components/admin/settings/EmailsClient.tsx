"use client";

import { useState } from "react";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { useToast } from "@/components/admin/ui/Toast";

export type TemplateRow = {
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  enabled: boolean;
  timingDays: number;
};

export type LogRow = {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: "SENT" | "FAILED" | "QUEUED";
  error: string;
  createdAt: string;
};

export function EmailsClient({
  me,
  templates: initialTemplates,
  initialLog,
  smtpConfigured,
}: {
  me: string;
  templates: TemplateRow[];
  initialLog: LogRow[];
  smtpConfigured: boolean;
}) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [log, setLog] = useState(initialLog);
  const [tab, setTab] = useState<"templates" | "log">("templates");
  const [editing, setEditing] = useState<TemplateRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const refreshLog = async (status?: string) => {
    const res = await fetch(`/api/v1/admin/emails${status ? `?status=${status}` : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setLog(data.data.items.map((l: LogRow & { createdAt: string }) => ({ ...l })));
      setTemplates(data.data.templates);
    }
  };

  const toggle = async (tpl: TemplateRow) => {
    setTemplates(templates.map((t) => (t.key === tpl.key ? { ...t, enabled: !t.enabled } : t)));
    const res = await fetch("/api/v1/admin/emails/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", key: tpl.key, enabled: !tpl.enabled }),
    });
    if (!res.ok) {
      setTemplates(templates);
      toast("Not saved — try again.", { error: true });
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/emails", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editing.key, subject: editing.subject, body: editing.body, timingDays: editing.timingDays }),
      });
      if (!res.ok) throw new Error();
      setTemplates(templates.map((t) => (t.key === editing.key ? { ...t, subject: editing.subject, body: editing.body, timingDays: editing.timingDays } : t)));
      toast("Saved — future emails use the new wording.");
      setEditing(null);
    } catch {
      toast("Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async (key: string) => {
    setTesting(key);
    try {
      const res = await fetch("/api/v1/admin/emails/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", key, to: me }),
      });
      if (!res.ok) throw new Error();
      toast(`Test sent to ${me}.`);
    } catch {
      toast("Couldn't send — check SMTP is configured.", { error: true });
    } finally {
      setTesting(null);
      void refreshLog(statusFilter || undefined);
    }
  };

  const resend = async (id: string) => {
    setResending(id);
    try {
      const res = await fetch("/api/v1/admin/emails/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", logId: id }),
      });
      if (!res.ok) throw new Error();
      toast("Re-sent.");
    } catch {
      toast("Couldn't resend — try again.", { error: true });
    } finally {
      setResending(null);
      void refreshLog(statusFilter || undefined);
    }
  };

  const vars = editing ? Array.from(new Set([...editing.subject.matchAll(/\[(\w+)\]/g), ...editing.body.matchAll(/\[(\w+)\]/g)].map((m) => m[1]))) : [];

  return (
    <div className="mt-5">
      {!smtpConfigured && (
        <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: "var(--light-peach)", border: "1px solid var(--peach)" }}>
          Email isn&apos;t configured yet — add <code>SMTP_HOST</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code> and <code>EMAIL_FROM</code> to the environment so messages actually send. Attempts are logged below either way.
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {(["templates", "log"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`a-chip ${tab === t ? "a-chip-green" : "a-chip-grey"}`}
            style={{ cursor: "pointer" }}
          >
            {t === "templates" ? "Templates" : "Sent log"}
          </button>
        ))}
      </div>

      {tab === "templates" ? (
        <div className="a-card divide-y">
          {templates.map((t) => (
            <div key={t.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{t.name}</span>
                  {!t.enabled && <span className="a-chip a-chip-dashed">Off</span>}
                </div>
                <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>{t.description}</p>
                <p className="truncate text-xs italic" style={{ color: "var(--admin-ink-soft)" }}>Subject: {t.subject}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {t.key === "event-reminder" && (
                  <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{t.timingDays}d before</span>
                )}
                <Toggle checked={t.enabled} onChange={() => void toggle(t)} label={t.enabled ? "On" : "Off"} />
                <button type="button" onClick={() => void sendTest(t.key)} disabled={testing === t.key} className="a-btn a-btn-ghost a-btn-sm">
                  {testing === t.key ? "Sending…" : "Send me a test"}
                </button>
                <button type="button" onClick={() => { setEditing({ ...t }); setPreview(false); }} className="a-btn a-btn-outline a-btn-sm">Edit</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            {["", "SENT", "FAILED"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setStatusFilter(s); void refreshLog(s || undefined); }}
                className={`a-chip ${statusFilter === s ? "a-chip-green" : "a-chip-grey"}`}
                style={{ cursor: "pointer" }}
              >
                {s || "All"}
              </button>
            ))}
          </div>
          {log.length === 0 ? (
            <EmptyState icon="send" title="Nothing sent yet" body="Every email the site sends lands here — tickets, reminders, notifications." />
          ) : (
            <div className="a-card divide-y">
              {log.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`a-chip ${l.status === "SENT" ? "a-chip-green" : l.status === "FAILED" ? "a-chip-red" : "a-chip-amber"}`}>
                    {l.status === "SENT" ? "Sent" : l.status === "FAILED" ? "Failed" : "Queued"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.subject}</p>
                    <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                      to {l.to} · {l.template || "custom"} · {new Date(l.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      {l.error ? ` · ${l.error}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => void resend(l.id)} disabled={resending === l.id} className="a-btn a-btn-ghost a-btn-sm">
                    {resending === l.id ? "…" : "Resend"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit — ${editing.name}` : ""}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.subject || !editing?.body} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{editing.description}</p>
            <Field label="Subject" required>
              <input className="a-input" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} />
            </Field>
            <Field label="Body" required hint="Blank line = new paragraph. Write like you'd text a friend.">
              {preview ? (
                <div className="rounded-xl p-4 text-sm leading-7" style={{ border: "1px solid var(--admin-line)", background: "#fff" }}>
                  {editing.body.split(/\n{2,}/).map((p, i) => (
                    <p key={i} className="mb-3">{p}</p>
                  ))}
                </div>
              ) : (
                <textarea className="a-input min-h-48" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              )}
            </Field>
            <button type="button" onClick={() => setPreview(!preview)} className="a-btn a-btn-outline a-btn-sm">
              {preview ? "Back to editing" : "Preview"}
            </button>
            {editing.key === "event-reminder" && (
              <Field label="Send this many days before the event">
                <input type="number" min={0} max={30} className="a-input w-24" value={editing.timingDays} onChange={(e) => setEditing({ ...editing, timingDays: Number(e.target.value) || 0 })} />
              </Field>
            )}
            {vars.length > 0 && (
              <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                Fill-ins used: {vars.map((v) => `[${v}]`).join(" ")}
              </p>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
