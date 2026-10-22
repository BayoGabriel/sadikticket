"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatNaira } from "@/lib/format";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { Modal } from "@/components/admin/ui/Modal";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";

type OrderDoc = {
  _id: string;
  paymentReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  status: string;
  paymentMethod?: string;
  manual?: boolean;
  soldBy?: string;
  checkoutAnswer?: string;
  refundedAmount?: number;
  refundReason?: string;
  transferredTo?: string;
  notes?: { text: string; author?: string; createdAt?: string }[];
  createdAt: string;
  updatedAt?: string;
};

type TicketRow = {
  id: string;
  code: string;
  holderName: string;
  status: string;
  checkedInAt: string | null;
  emailStatus?: string;
  qr?: string;
  typeName: string;
};

export function OrderDetailClient({
  order,
  tickets,
  event,
  transferTargets,
}: {
  order: OrderDoc;
  tickets: TicketRow[];
  event: { id: string; name: string; slug: string; startsAt: string; venueName: string; city: string } | null;
  transferTargets: { id: string; name: string; types: { id: string; name: string; remaining: number }[] }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [edit, setEdit] = useState({ name: order.customerName, email: order.customerEmail, phone: order.customerPhone ?? "" });
  const [transferOpen, setTransferOpen] = useState(false);
  const [transfer, setTransfer] = useState({ toName: "", toEmail: "", toEventId: "", toTicketTypeId: "" });
  const [note, setNote] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function act(action: string, body?: unknown, successMsg?: string) {
    setBusy(action);
    try {
      const res = await fetch(`/api/v1/admin/orders/${order._id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "That didn't work");
      toast(successMsg ?? "Done.");
      return data.data;
    } catch (e) {
      toast((e as Error).message, { error: true });
      return null;
    } finally {
      setBusy("");
      router.refresh();
    }
  }

  const remaining = order.total - (order.refundedAmount ?? 0);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* Buyer */}
        <section className="a-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="a-label">Buyer</p>
              <p className="text-lg font-bold">{order.customerName}</p>
              <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
                {order.customerEmail}{order.customerPhone ? ` · ${order.customerPhone}` : ""}
              </p>
              {order.transferredTo && <p className="mt-1 text-xs" style={{ color: "var(--admin-amber)" }}>Transferred to {order.transferredTo}</p>}
            </div>
            <StatusChip status={order.status} />
          </div>
          {order.checkoutAnswer && (
            <p className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ background: "var(--mint)" }}>
              “{order.checkoutAnswer}” <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>— checkout answer</span>
            </p>
          )}
        </section>

        {/* Line items */}
        <section className="a-card p-5">
          <p className="a-label">Items</p>
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between py-2 text-sm" style={{ borderColor: "var(--line)" }}>
                <span>{it.quantity}× {it.name}</span>
                <span className="font-semibold">{formatNaira(it.unitPrice * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1 border-t pt-2 text-sm" style={{ borderColor: "var(--line)" }}>
            <div className="flex justify-between"><span style={{ color: "var(--admin-ink-soft)" }}>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
            {!!order.discountAmount && (
              <div className="flex justify-between"><span style={{ color: "var(--admin-ink-soft)" }}>Coupon {order.couponCode}</span><span>−{formatNaira(order.discountAmount)}</span></div>
            )}
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatNaira(order.total)}</span></div>
            {!!order.refundedAmount && (
              <div className="flex justify-between" style={{ color: "var(--admin-amber)" }}>
                <span>Refunded</span><span>−{formatNaira(order.refundedAmount)}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
            Ref {order.paymentReference} · {order.paymentMethod ?? "paystack"}{order.manual ? ` · manual sale by ${order.soldBy}` : ""}
          </p>
        </section>

        {/* Tickets */}
        <section className="a-card p-5">
          <p className="a-label">Tickets ({tickets.length})</p>
          {tickets.length === 0 && <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>No tickets yet — they appear when the order is paid.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {tickets.map((t) => (
              <div key={t.id} className="flex gap-3 rounded-xl border p-3" style={{ borderColor: "var(--line)" }}>
                {t.qr && <img src={t.qr} alt={`QR for ${t.code}`} className="h-16 w-16 rounded-lg" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{t.holderName}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{t.typeName} · <span className="font-mono">{t.code}</span></p>
                  <StatusChip status={t.status === "CHECKED_IN" ? "CHECKED_IN" : t.status === "VOID" ? "REFUNDED" : "ISSUED"} />
                  {t.checkedInAt && <p className="mt-0.5 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{format(new Date(t.checkedInAt), "d MMM, h:mma")}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Notes + timeline */}
        <section className="a-card p-5">
          <p className="a-label">Timeline & notes</p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><Icon name="check" size={14} className="mt-0.5" /> Created {format(new Date(order.createdAt), "d MMM yyyy, h:mma")}</li>
            {(order.notes ?? []).map((n, i) => (
              <li key={i} className="flex gap-2">
                <Icon name="edit" size={14} className="mt-0.5" />
                <span>{n.text} <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{n.createdAt ? `· ${format(new Date(n.createdAt), "d MMM, h:mma")}` : ""}</span></span>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!note.trim()) return;
              const res = await fetch(`/api/v1/admin/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note }),
              });
              if ((await res.json()).success) { setNote(""); router.refresh(); }
            }}
          >
            <input className="a-input" placeholder="Add an internal note…" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="a-btn a-btn-ghost" type="submit">Add</button>
          </form>
        </section>
      </div>

      {/* Actions column */}
      <aside className="space-y-4">
        <section className="a-card p-5">
          <p className="a-label">Actions</p>
          <div className="space-y-2">
            {order.status === "PAID" && (
              <>
                <button className="a-btn a-btn-green w-full" disabled={busy === "resend"} onClick={async () => { await act("resend"); }}>
                  <Icon name="send" size={14} /> Resend ticket email
                </button>
                {event && (
                  <Link href={`/admin/check-in?event=${event.id}`} className="a-btn a-btn-ghost w-full"><Icon name="scan" size={14} /> Open check-in</Link>
                )}
                <button className="a-btn a-btn-ghost w-full" onClick={() => setTransferOpen(true)}>
                  <Icon name="move" size={14} /> Transfer
                </button>
                <button className="a-btn a-btn-orange w-full" onClick={() => { setRefundAmount(String(order.total / 100)); setRefundOpen(true); }}>
                  <Icon name="undo" size={14} /> Issue refund
                </button>
              </>
            )}
            {["PENDING", "PAYMENT_PROCESSING", "FAILED"].includes(order.status) && (
              <>
                {order.paymentMethod === "paystack" && (
                  <button className="a-btn a-btn-green w-full" disabled={busy === "reverify"} onClick={async () => { const r = await act("reverify"); if (r?.status === "PAID") toast("Confirmed paid — tickets issued."); }}>
                    <Icon name="refresh" size={14} /> Re-verify with Paystack
                  </button>
                )}
                <button className="a-btn a-btn-ghost w-full" disabled={busy === "mark-paid"} onClick={async () => { await act("mark-paid"); }}>
                  <Icon name="check" size={14} /> Mark as paid
                </button>
              </>
            )}
            {["PENDING", "PAYMENT_PROCESSING", "FAILED"].includes(order.status) && (
              <button className="a-btn a-btn-ghost w-full" style={{ color: "var(--admin-red)" }} onClick={() => setConfirmCancel(true)}>
                <Icon name="x" size={14} /> Cancel order
              </button>
            )}
            <button className="a-btn a-btn-ghost w-full" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={14} /> Edit buyer details
            </button>
          </div>
        </section>

        {event && (
          <section className="a-card p-5 text-sm">
            <p className="a-label">Event</p>
            <p className="font-bold">{event.name}</p>
            <p style={{ color: "var(--admin-ink-soft)" }}>
              {format(new Date(event.startsAt), "EEE d MMM, h:mma")} · {event.venueName}, {event.city}
            </p>
            <Link href={`/admin/events/${event.id}`} className="a-btn a-btn-ghost a-btn-sm mt-2">Open event</Link>
          </section>
        )}
      </aside>

      {/* Refund modal */}
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Issue a refund" width={440}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            {formatNaira(remaining)} refundable. {order.paymentMethod === "paystack" ? "We'll try Paystack's refund API; if it can't, record it manually and refund the buyer directly." : "This was a manual sale — refund the buyer the same way they paid."} {order.status === "PAID" && "A full refund voids the tickets and frees the seats."}
          </p>
          <Field label="Amount (₦)" hint={`Leave ${formatNaira(order.total)} for a full refund.`}>
            <input className="a-input" type="number" min="1" max={remaining / 100} value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
          </Field>
          <Field label="Reason" hint="Optional — shown on the order and in the refund email.">
            <input className="a-input" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="e.g. guest couldn't make it" />
          </Field>
          <button
            className="a-btn a-btn-orange w-full"
            disabled={!!busy}
            onClick={async () => {
              const amount = Number(refundAmount);
              if (!amount || amount <= 0) { toast("Enter an amount.", { error: true }); return; }
              const r = await act("refund", { amountNaira: amount, reason: refundReason || undefined });
              if (r) { setRefundOpen(false); toast(r.providerRefund ? `Refunded ${r.refundedLabel} via Paystack.` : `${r.refundedLabel} recorded — refund the buyer directly.`); }
            }}
          >
            {busy ? "Refunding…" : `Refund ${refundAmount ? formatNaira(Number(refundAmount) * 100) : ""}`}
          </button>
        </div>
      </Modal>

      {/* Edit buyer */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit buyer details" width={440}>
        <div className="space-y-4">
          <Field label="Name"><input className="a-input" value={edit.name} onChange={(e) => setEdit((s) => ({ ...s, name: e.target.value }))} /></Field>
          <Field label="Email"><input className="a-input" type="email" value={edit.email} onChange={(e) => setEdit((s) => ({ ...s, email: e.target.value }))} /></Field>
          <Field label="Phone"><input className="a-input" value={edit.phone} onChange={(e) => setEdit((s) => ({ ...s, phone: e.target.value }))} /></Field>
          <button
            className="a-btn a-btn-orange w-full"
            onClick={async () => {
              const res = await fetch(`/api/v1/admin/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerName: edit.name, customerEmail: edit.email, customerPhone: edit.phone }),
              });
              if ((await res.json()).success) { setEditOpen(false); toast("Saved."); router.refresh(); }
              else toast("Couldn't save.", { error: true });
            }}
          >
            Save
          </button>
        </div>
      </Modal>

      {/* Transfer */}
      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer order" width={440}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>Send these tickets to someone else, or move them to another event (the seats move too). Tickets are re-emailed after.</p>
          <Field label="New name"><input className="a-input" value={transfer.toName} onChange={(e) => setTransfer((s) => ({ ...s, toName: e.target.value }))} /></Field>
          <Field label="New email"><input className="a-input" type="email" value={transfer.toEmail} onChange={(e) => setTransfer((s) => ({ ...s, toEmail: e.target.value }))} /></Field>
          {transferTargets.length > 0 && (
            <>
              <Field label="Or move to event">
                <select className="a-select" value={transfer.toEventId} onChange={(e) => setTransfer((s) => ({ ...s, toEventId: e.target.value, toTicketTypeId: "" }))}>
                  <option value="">Keep this event</option>
                  {transferTargets.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              {transfer.toEventId && (
                <Field label="Ticket type on the new event">
                  <select className="a-select" value={transfer.toTicketTypeId} onChange={(e) => setTransfer((s) => ({ ...s, toTicketTypeId: e.target.value }))}>
                    <option value="">Pick a type…</option>
                    {transferTargets.find((t) => t.id === transfer.toEventId)?.types.map((tt) => (
                      <option key={tt.id} value={tt.id} disabled={tt.remaining < order.items.reduce((a, i) => a + i.quantity, 0)}>
                        {tt.name} ({tt.remaining} left)
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}
          <button
            className="a-btn a-btn-orange w-full"
            disabled={!!busy || (!transfer.toName && !transfer.toEmail && !transfer.toEventId)}
            onClick={async () => {
              const r = await act("transfer", {
                toName: transfer.toName || undefined,
                toEmail: transfer.toEmail || undefined,
                toEventId: transfer.toEventId || undefined,
                toTicketTypeId: transfer.toTicketTypeId || undefined,
              });
              if (r) { setTransferOpen(false); toast("Transferred — fresh tickets sent."); }
            }}
          >
            Transfer
          </button>
        </div>
      </Modal>

      {/* Cancel confirm */}
      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this order?" width={400}>
        <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>Any held seats are released. This can&rsquo;t be undone.</p>
        <div className="mt-4 flex gap-2">
          <button className="a-btn a-btn-ghost flex-1" onClick={() => setConfirmCancel(false)}>Keep it</button>
          <button
            className="a-btn flex-1"
            style={{ background: "var(--admin-red)", color: "#fff" }}
            disabled={!!busy}
            onClick={async () => { const r = await act("cancel"); if (r) setConfirmCancel(false); }}
          >
            Cancel order
          </button>
        </div>
      </Modal>
    </div>
  );
}
