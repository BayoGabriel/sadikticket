"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { formatNaira } from "@/lib/format";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable, Pagination } from "@/components/admin/ui/AdminTable";
import { useToast } from "@/components/admin/ui/Toast";
import { ManualSaleModal } from "./ManualSaleModal";

type OrderRow = {
  id: string;
  paymentReference: string;
  eventName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: { name: string; quantity: number }[];
  total: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  manual?: boolean;
  createdAt: string;
  checkoutAnswer?: string;
};

const TABS = [
  { key: "", label: "All" },
  { key: "PAID", label: "Paid" },
  { key: "PENDING", label: "Pending" },
  { key: "FAILED", label: "Failed" },
  { key: "REFUNDED", label: "Refunded" },
];

export function OrdersClient({
  initial,
  events,
  query,
}: {
  initial: { items: OrderRow[]; total: number; page: number; pages: number };
  events: { id: string; name: string }[];
  query: { event: string; status: string; q: string; from: string; to: string; page: number; newManual: boolean };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [q, setQ] = useState(query.q);
  const [manualOpen, setManualOpen] = useState(query.newManual);

  function setParam(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    router.push(`/admin/orders?${next.toString()}`);
  }

  async function reverify(id: string) {
    const res = await fetch(`/api/v1/admin/orders/${id}/reverify`, { method: "POST" });
    const data = await res.json();
    if (data.success && data.data.status === "PAID") {
      toast("Payment confirmed — tickets issued.");
      router.refresh();
    } else toast(data.success ? `Paystack says: ${data.data.status}` : data.error || "Couldn't verify.", { error: data.data?.status !== "PAID" });
  }

  return (
    <div>
      {/* Tabs + actions */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="a-card flex p-0.5" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={query.status === t.key}
              className="min-h-[36px] rounded-full px-3.5 text-sm font-bold"
              style={{ background: query.status === t.key ? "var(--green)" : "transparent", color: query.status === t.key ? "var(--cream)" : "var(--admin-ink-soft)" }}
              onClick={() => setParam({ status: t.key })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <a href={`/api/v1/admin/orders?format=csv&${sp.toString()}`} className="a-btn a-btn-ghost a-btn-sm">
            <Icon name="download" size={14} /> CSV
          </a>
          <button type="button" className="a-btn a-btn-orange a-btn-sm" onClick={() => setManualOpen(true)}>
            <Icon name="plus" size={14} /> Manual sale
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <form className="flex min-w-0 flex-1 gap-2 sm:flex-none" onSubmit={(e) => { e.preventDefault(); setParam({ q }); }}>
          <input className="a-input sm:w-72" placeholder="Name, email, phone, reference, ticket code…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
        </form>
        <select className="a-select" style={{ width: "auto" }} value={query.event} onChange={(e) => setParam({ event: e.target.value })} aria-label="Filter by event">
          <option value="">All events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input type="date" className="a-input" style={{ width: "auto" }} value={query.from} onChange={(e) => setParam({ from: e.target.value })} aria-label="From date" />
        <span className="self-center text-sm" style={{ color: "var(--admin-ink-soft)" }}>→</span>
        <input type="date" className="a-input" style={{ width: "auto" }} value={query.to} onChange={(e) => setParam({ to: e.target.value })} aria-label="To date" />
      </div>

      {initial.items.length === 0 ? (
        <EmptyState
          icon="ticket"
          title="No orders match."
          body="When tickets start selling, they'll land here. Or take a cash/POS sale yourself."
          actionLabel="Add manual sale"
          onAction={() => setManualOpen(true)}
        />
      ) : (
        <AdminTable
          rows={initial.items}
          rowKey={(o) => o.id}
          onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
          renderCard={(o) => (
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{o.customerName}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{o.eventName}</p>
                </div>
                <StatusChip status={o.status} />
              </div>
              <p className="mt-1 text-sm">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-bold">{formatNaira(o.total)}</span>
                <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{format(new Date(o.createdAt), "d MMM, h:mma")}</span>
              </div>
            </div>
          )}
          columns={[
            {
              label: "Buyer",
              render: (o) => (
                <div>
                  <p className="font-semibold">{o.customerName}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{o.customerEmail}</p>
                </div>
              ),
            },
            {
              label: "Event",
              render: (o) => <span className="text-sm">{o.eventName}</span>,
            },
            {
              label: "Tickets",
              render: (o) => <span className="text-sm">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}{o.manual ? " · manual" : ""}</span>,
            },
            { label: "Total", render: (o) => <span className="text-sm font-bold">{formatNaira(o.total)}</span> },
            { label: "Status", render: (o) => <StatusChip status={o.status} /> },
            {
              label: "When",
              render: (o) => <span className="whitespace-nowrap text-xs" style={{ color: "var(--admin-ink-soft)" }}>{format(new Date(o.createdAt), "d MMM yy, h:mma")}</span>,
            },
            {
              label: "",
              render: (o) =>
                ["PENDING", "PAYMENT_PROCESSING", "FAILED"].includes(o.status) && o.paymentMethod === "paystack" ? (
                  <button
                    type="button"
                    className="a-btn a-btn-ghost a-btn-sm"
                    onClick={(e) => { e.stopPropagation(); reverify(o.id); }}
                  >
                    <Icon name="refresh" size={14} /> Re-verify
                  </button>
                ) : null,
            },
          ]}
        />
      )}

      <Pagination page={initial.page} pages={initial.pages} onPage={(p) => setParam({ page: String(p) })} />

      <ManualSaleModal open={manualOpen} onClose={() => setManualOpen(false)} events={events} />
    </div>
  );
}
