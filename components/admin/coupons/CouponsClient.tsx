"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Modal, ConfirmDialog } from "@/components/admin/ui/Modal";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { formatNaira } from "@/lib/format";

export type CouponRow = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number; // percent or kobo
  startsAt: string | null;
  expiresAt: string | null;
  usageCount: number;
  usageLimit: number | null;
  perCustomerLimit: number | null;
  minOrderAmount: number | null;
  eventIds: string[];
  ticketTypeIds: string[];
  discountedTotal: number;
  active: boolean;
};

type Form = {
  code: string;
  kind: "percent" | "fixed";
  value: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perCustomerLimit: string;
  minOrderNaira: string;
  eventIds: string[];
  ticketTypeIds: string[];
  active: boolean;
};

const empty: Form = {
  code: "",
  kind: "percent",
  value: "",
  startsAt: "",
  expiresAt: "",
  usageLimit: "",
  perCustomerLimit: "",
  minOrderNaira: "",
  eventIds: [],
  ticketTypeIds: [],
  active: true,
};

function toForm(c: CouponRow): Form {
  return {
    code: c.code,
    kind: c.kind,
    value: c.kind === "percent" ? String(c.value) : String(c.value / 100),
    startsAt: c.startsAt ? c.startsAt.slice(0, 16) : "",
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 16) : "",
    usageLimit: c.usageLimit?.toString() ?? "",
    perCustomerLimit: c.perCustomerLimit?.toString() ?? "",
    minOrderNaira: c.minOrderAmount ? String(c.minOrderAmount / 100) : "",
    eventIds: c.eventIds,
    ticketTypeIds: c.ticketTypeIds,
    active: c.active,
  };
}

export function CouponsClient({
  items,
  events,
  ticketTypes,
  eventName,
  openNew,
}: {
  items: CouponRow[];
  events: { id: string; name: string }[];
  ticketTypes: { id: string; eventId: string; name: string }[];
  eventName: Record<string, string>;
  openNew: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [modal, setModal] = useState(openNew);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = useState<CouponRow | null>(null);
  const [ordersFor, setOrdersFor] = useState<{ code: string; orders: { id: string; reference: string; customer: string; total: number; status: string }[] } | null>(null);

  function open(c?: CouponRow) {
    setEditing(c?.id ?? null);
    setForm(c ? toForm(c) : empty);
    setErrors({});
    setModal(true);
  }

  async function save() {
    const errs: Record<string, string> = {};
    if (!form.value || Number(form.value) <= 0) errs.value = "Give it a value — 10 for 10% or 2000 for ₦2,000.";
    if (form.kind === "percent" && Number(form.value) > 100) errs.value = "Percent can't go above 100.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const body = {
        ...(editing ? {} : { code: form.code || undefined }),
        kind: form.kind,
        value: Number(form.value),
        startsAt: form.startsAt || undefined,
        expiresAt: form.expiresAt || undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perCustomerLimit: form.perCustomerLimit ? Number(form.perCustomerLimit) : null,
        minOrderNaira: form.minOrderNaira ? Number(form.minOrderNaira) : null,
        eventIds: form.eventIds,
        ticketTypeIds: form.ticketTypeIds,
        active: form.active,
      };
      const res = await fetch(editing ? `/api/v1/admin/coupons/${editing}` : "/api/v1/admin/coupons", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Couldn't save");
      toast(editing ? "Coupon updated." : `Code ${d.data.code} is live.`);
      setModal(false);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(c: CouponRow) {
    const res = await fetch(`/api/v1/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if ((await res.json()).success) {
      toast(c.active ? `${c.code} is off.` : `${c.code} is back on.`);
      router.refresh();
    }
  }

  async function duplicate(c: CouponRow) {
    const res = await fetch(`/api/v1/admin/coupons/${c.id}`, { method: "POST" });
    const d = await res.json();
    if (d.success) { toast(`Copied as ${d.data.code}.`); router.refresh(); }
    else toast(d.error || "Couldn't copy.", { error: true });
  }

  async function remove(c: CouponRow) {
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/admin/coupons/${c.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast(d.data.deleted ? `${c.code} deleted.` : `${c.code} had been used, so we switched it off instead of deleting.`);
      setConfirmDel(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  async function showOrders(c: CouponRow) {
    const res = await fetch(`/api/v1/admin/coupons/${c.id}`);
    const d = await res.json();
    if (d.success) setOrdersFor({ code: c.code, orders: d.data.orders });
  }

  const scopedTypes = form.eventIds.length
    ? ticketTypes.filter((t) => form.eventIds.includes(t.eventId))
    : ticketTypes;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/v1/admin/coupons?format=csv" className="a-btn a-btn-ghost a-btn-sm"><Icon name="download" size={14} /> CSV</a>
        <button className="a-btn a-btn-orange a-btn-sm" onClick={() => open()}><Icon name="plus" size={14} /> New coupon</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="tag" title="No coupons yet." body="Make a code for a partner, a friend rate, or a last-tickets push." actionLabel="New coupon" onAction={() => open()} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((c) => (
            <div key={c.id} className="a-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-lg font-bold tracking-wide">{c.code}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--orange)" }}>
                    {c.kind === "percent" ? `${c.value}% off` : `${formatNaira(c.value)} off`}
                  </p>
                </div>
                <StatusChip status={c.active ? "active" : "inactive"} />
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: "var(--admin-ink-soft)" }}>
                {c.eventIds.length ? c.eventIds.map((e) => eventName[e] ?? "?").join(", ") : "All events"}
                {c.ticketTypeIds.length ? ` · ${c.ticketTypeIds.length} ticket type${c.ticketTypeIds.length === 1 ? "" : "s"}` : ""}
                {c.minOrderAmount ? ` · min ${formatNaira(c.minOrderAmount)}` : ""}
                {c.startsAt ? ` · from ${format(new Date(c.startsAt), "d MMM")}` : ""}
                {c.expiresAt ? ` · until ${format(new Date(c.expiresAt), "d MMM yyyy")}` : ""}
                {c.perCustomerLimit ? ` · ${c.perCustomerLimit}× per guest` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--admin-line)" }}>
                <button className="text-sm font-semibold underline" style={{ color: "var(--green)" }} onClick={() => showOrders(c)}>
                  Used {c.usageCount}{c.usageLimit != null ? `/${c.usageLimit}` : ""} × · {formatNaira(c.discountedTotal)} off
                </button>
                <div className="flex gap-1">
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => open(c)} aria-label={`Edit ${c.code}`}><Icon name="edit" size={14} /></button>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => duplicate(c)} aria-label={`Duplicate ${c.code}`}><Icon name="copy" size={14} /></button>
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => toggleActive(c)} aria-label={c.active ? "Deactivate" : "Activate"}>
                    <Icon name={c.active ? "x" : "check"} size={14} />
                  </button>
                  <button className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }} onClick={() => setConfirmDel(c)} aria-label={`Delete ${c.code}`}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `Edit ${form.code}` : "New coupon"} width={560}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" hint={editing ? "Codes can't be renamed." : "Leave blank to auto-generate one."}>
              <input className="a-input font-mono uppercase" value={form.code} disabled={!!editing} onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))} placeholder="SEREN-XXXXX" />
            </Field>
            <Field label="Type" required>
              <div className="flex gap-2">
                {(["percent", "fixed"] as const).map((k) => (
                  <button key={k} type="button" className="a-btn flex-1" style={{ background: form.kind === k ? "var(--green)" : "transparent", color: form.kind === k ? "var(--cream)" : "var(--admin-ink)", border: "1px solid var(--admin-line)" }} onClick={() => setForm((s) => ({ ...s, kind: k }))}>
                    {k === "percent" ? "% off" : "₦ off"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={form.kind === "percent" ? "Percent off" : "Amount off (₦)"} required error={errors.value}>
              <input className="a-input" type="number" min="1" max={form.kind === "percent" ? 100 : undefined} value={form.value} onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))} aria-invalid={!!errors.value} />
            </Field>
            <Field label="Minimum order (₦)" hint="Optional.">
              <input className="a-input" type="number" min="0" value={form.minOrderNaira} onChange={(e) => setForm((s) => ({ ...s, minOrderNaira: e.target.value }))} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" hint="Optional — code works immediately if blank.">
              <input className="a-input" type="datetime-local" value={form.startsAt} onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))} />
            </Field>
            <Field label="Expires" hint="Optional.">
              <input className="a-input" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm((s) => ({ ...s, expiresAt: e.target.value }))} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Total uses" hint="Blank = unlimited.">
              <input className="a-input" type="number" min="1" value={form.usageLimit} onChange={(e) => setForm((s) => ({ ...s, usageLimit: e.target.value }))} />
            </Field>
            <Field label="Uses per guest" hint="Blank = unlimited.">
              <input className="a-input" type="number" min="1" value={form.perCustomerLimit} onChange={(e) => setForm((s) => ({ ...s, perCustomerLimit: e.target.value }))} />
            </Field>
          </div>
          <Field label="Applies to" hint="No selection = every event.">
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border p-2" style={{ borderColor: "var(--admin-line)" }}>
              {events.map((e) => (
                <label key={e.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-black/5">
                  <input
                    type="checkbox"
                    checked={form.eventIds.includes(e.id)}
                    onChange={() => setForm((s) => ({ ...s, eventIds: s.eventIds.includes(e.id) ? s.eventIds.filter((x) => x !== e.id) : [...s.eventIds, e.id] }))}
                  />
                  {e.name}
                </label>
              ))}
            </div>
          </Field>
          {scopedTypes.length > 0 && (
            <Field label="Specific ticket types" hint="Optional — limits the code to chosen types.">
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border p-2" style={{ borderColor: "var(--admin-line)" }}>
                {scopedTypes.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-black/5">
                    <input
                      type="checkbox"
                      checked={form.ticketTypeIds.includes(t.id)}
                      onChange={() => setForm((s) => ({ ...s, ticketTypeIds: s.ticketTypeIds.includes(t.id) ? s.ticketTypeIds.filter((x) => x !== t.id) : [...s.ticketTypeIds, t.id] }))}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </Field>
          )}
          <Toggle checked={form.active} onChange={(v) => setForm((s) => ({ ...s, active: v }))} label="Active" hint="Guests can use it at checkout." />
          <button className="a-btn a-btn-orange w-full" disabled={busy} onClick={save}>
            {busy ? "Saving…" : editing ? "Save changes" : "Create coupon"}
          </button>
        </div>
      </Modal>

      {/* Orders that used it */}
      <Modal open={!!ordersFor} onClose={() => setOrdersFor(null)} title={`Orders using ${ordersFor?.code}`} width={520}>
        {ordersFor?.orders.length ? (
          <ul className="divide-y" style={{ borderColor: "var(--admin-line)" }}>
            {ordersFor.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                <span>{o.customer} <span className="font-mono text-xs" style={{ color: "var(--admin-ink-soft)" }}>{o.reference}</span></span>
                <span className="flex items-center gap-2"><StatusChip status={o.status} /> {formatNaira(o.total)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>No orders have used this code yet.</p>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && remove(confirmDel)}
        title={`Delete ${confirmDel?.code}?`}
        body={confirmDel && confirmDel.usageCount > 0 ? `This code has been used ${confirmDel.usageCount} times, so we'll deactivate it instead — the history stays.` : "This removes the code completely."}
        confirmLabel={confirmDel && confirmDel.usageCount > 0 ? "Deactivate" : "Delete"}
        requireText={confirmDel?.code}
        loading={busy}
      />
    </div>
  );
}
