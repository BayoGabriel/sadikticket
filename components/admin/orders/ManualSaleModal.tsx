"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/admin/ui/Modal";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { formatNaira } from "@/lib/format";

type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  quantitySold: number;
  status: string;
};

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Bank transfer" },
  { value: "pos", label: "POS" },
  { value: "complimentary", label: "Complimentary" },
] as const;

export function ManualSaleModal({
  open,
  onClose,
  events,
}: {
  open: boolean;
  onClose: () => void;
  events: { id: string; name: string }[];
}) {
  // Keyed remount on each open → the form always starts fresh.
  if (!open) return null;
  return <ManualSaleModalInner key={String(open)} onClose={onClose} events={events} />;
}

function ManualSaleModalInner({
  onClose,
  events,
}: {
  onClose: () => void;
  events: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<string>("cash");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!eventId) return;
    let live = true;
    Promise.resolve()
      .then(() => { if (live) setLoadingTypes(true); return fetch(`/api/v1/admin/events/${eventId}/ticket-types?limit=100`); })
      .then((r) => r.json())
      .then((d) => { if (live) setTypes((d.data?.items ?? []).filter((t: TicketType) => t.status === "ACTIVE")); })
      .catch(() => { if (live) setTypes([]); })
      .finally(() => { if (live) setLoadingTypes(false); });
    return () => { live = false; };
  }, [eventId]);

  const items = Object.entries(qty)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => {
      const t = types.find((x) => x.id === id)!;
      return { ticketTypeId: id, quantity: n, price: t.price };
    });
  const total = method === "complimentary" ? 0 : items.reduce((a, i) => a + i.price * i.quantity, 0);

  async function submit() {
    const errs: Record<string, string> = {};
    if (!items.length) errs.items = "Pick at least one ticket.";
    if (!name.trim()) errs.name = "Buyer's name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "A real email — the tickets go there.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          items: items.map(({ ticketTypeId, quantity }) => ({ ticketTypeId, quantity })),
          customer: { name, email, phone: phone || undefined },
          method,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Couldn't save the sale");
      toast("Sale recorded — tickets are on their way.", {
        actionLabel: "Open order",
        onAction: () => router.push(`/admin/orders/${data.data.id}`),
      });
      onClose();
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add a manual sale" width={520}>
      <div className="space-y-4">
        <Field label="Event" required>
          <select className="a-select" value={eventId} onChange={(e) => { setEventId(e.target.value); setQty({}); }}>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </Field>

        <div>
          <p className="a-label">Tickets</p>
          {loadingTypes && <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>Loading ticket types…</p>}
          {!loadingTypes && types.length === 0 && (
            <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>This event has no active ticket types.</p>
          )}
          <div className="space-y-2">
            {types.map((t) => {
              const remaining = t.quantity - t.quantitySold;
              return (
                <div key={t.id} className="a-card flex items-center justify-between gap-3 px-4 py-3" style={{ background: "var(--admin-canvas)" }}>
                  <div>
                    <p className="text-sm font-bold">{t.name} <span style={{ color: "var(--admin-ink-soft)" }}>· {formatNaira(t.price)}</span></p>
                    <p className="text-xs" style={{ color: remaining <= 5 ? "var(--admin-red)" : "var(--admin-ink-soft)" }}>
                      {remaining <= 0 ? "Sold out" : `${remaining} left`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label="Fewer" disabled={!qty[t.id]} onClick={() => setQty((s) => ({ ...s, [t.id]: Math.max(0, (s[t.id] ?? 0) - 1) }))}>−</button>
                    <span className="w-6 text-center text-sm font-bold" aria-live="polite">{qty[t.id] ?? 0}</span>
                    <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label="More" disabled={remaining <= (qty[t.id] ?? 0)} onClick={() => setQty((s) => ({ ...s, [t.id]: (s[t.id] ?? 0) + 1 }))}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.items && <p className="a-error-text" role="alert">{errors.items}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Buyer's name" required error={errors.name}>
            <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input className="a-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" hint="Optional">
            <input className="a-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Paid by" required>
            <select className="a-select" value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Note" hint="Optional — e.g. 'paid cash at the door'.">
          <input className="a-input" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--mint)" }}>
          <span className="text-sm font-bold">Total {method === "complimentary" ? "(comp)" : ""}</span>
          <span className="admin-title text-xl font-extrabold">{formatNaira(total)}</span>
        </div>

        <button type="button" className="a-btn a-btn-orange w-full" disabled={busy} onClick={submit}>
          {busy ? "Saving…" : "Record sale & send tickets"}
        </button>
      </div>
    </Modal>
  );
}
