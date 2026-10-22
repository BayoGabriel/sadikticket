"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field } from "@/components/admin/ui/Field";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

export type MemberRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  invitedAt: string | null;
  lastLoginAt: string | null;
};

const ROLE_HINTS: Record<string, string> = {
  OWNER: "Everything — including team and settings.",
  MANAGER: "Everything except team and settings.",
  EVENTS_STAFF: "Events, orders, check-in and the waitlist.",
  DOOR_STAFF: "The check-in screen only.",
  CONTENT_EDITOR: "Content pages — experiences, gallery, FAQs, policies.",
};

export function TeamClient({
  me,
  roles,
  initial,
}: {
  me: string;
  roles: { value: string; label: string }[];
  initial: MemberRow[];
}) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "EVENTS_STAFF" });
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<MemberRow | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/team", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
  };

  const invite = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't invite.");
      toast(`Invite sent to ${form.email} — they'll set their own password.`);
      setInviting(false);
      setForm({ name: "", email: "", role: "EVENTS_STAFF" });
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't invite — try again.", { error: true });
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (m: MemberRow, role: string) => {
    setItems(items.map((i) => (i.id === m.id ? { ...i, role } : i)));
    const res = await fetch(`/api/v1/admin/team/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Couldn't change the role — try again.", { error: true });
    } else toast(`${m.name} is now ${roles.find((r) => r.value === role)?.label ?? role}.`);
  };

  const toggleActive = async (m: MemberRow) => {
    setItems(items.map((i) => (i.id === m.id ? { ...i, active: !i.active } : i)));
    const res = await fetch(`/api/v1/admin/team/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !m.active }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    }
  };

  const remove = async () => {
    if (!removing) return;
    const res = await fetch(`/api/v1/admin/team/${removing.id}`, { method: "DELETE" });
    if (res.ok) {
      toast(`${removing.name} can no longer sign in.`);
      setRemoving(null);
      await refresh();
    } else toast("Couldn't remove them — try again.", { error: true });
  };

  return (
    <div className="mt-5">
      <div className="a-card divide-y">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
            {items.length} {items.length === 1 ? "person" : "people"}
          </p>
          <button type="button" onClick={() => setInviting(true)} className="a-btn a-btn-orange a-btn-sm">
            <Icon name="plus" size={14} /> Invite someone
          </button>
        </div>
        {items.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold"
              style={{ background: m.active ? "var(--mint)" : "#eee", color: "var(--green)" }}
            >
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{m.name}</span>
                {m.id === me && <span className="a-chip a-chip-green">You</span>}
                {!m.active && <span className="a-chip a-chip-dashed">Deactivated</span>}
              </div>
              <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                {m.email}
                {m.lastLoginAt
                  ? ` · last in ${new Date(m.lastLoginAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                  : " · hasn't signed in yet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="a-input a-select"
                style={{ minHeight: 36, width: "auto", padding: "0.35rem 0.6rem", fontSize: "0.8125rem" }}
                value={m.role}
                disabled={m.id === me}
                onChange={(e) => void changeRole(m, e.target.value)}
                aria-label={`Role for ${m.name}`}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {m.id !== me && (
                <button
                  type="button"
                  onClick={() => (m.active ? setRemoving(m) : void toggleActive(m))}
                  className="a-btn a-btn-ghost a-btn-sm"
                  style={m.active ? { color: "var(--admin-red)" } : {}}
                >
                  {m.active ? "Deactivate" : "Reactivate"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Drawer
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite someone"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setInviting(false)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void invite()} disabled={busy || !form.name || !form.email} className="a-btn a-btn-orange">
              {busy ? "Sending…" : "Send invite"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            They&apos;ll get an email with a link to set their own password — you never see or share passwords.
          </p>
          <Field label="Name" required>
            <input className="a-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <input className="a-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Role" hint={ROLE_HINTS[form.role]}>
            <select className="a-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => void remove()}
        title={`Remove ${removing?.name}'s access?`}
        body="They won't be able to sign in anymore. You can re-invite them later."
        confirmLabel="Remove access"
      />
    </div>
  );
}
