"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Toggle } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";
import { formatNaira } from "@/lib/format";

export type ShopOrderRow = {
  id: string;
  reference: string;
  customer: string;
  items: string;
  total: number;
  status: string;
  deliveryNote: string;
  fulfilled: boolean;
  createdAt: string;
};

const statusChip = (s: string) =>
  s === "PAID"
    ? "a-chip a-chip-green"
    : s === "FAILED" || s === "CANCELLED" || s === "REFUNDED"
      ? "a-chip a-chip-red"
      : "a-chip a-chip-amber";

export function ShopOrdersClient({ initial }: { initial: ShopOrderRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);

  const toggleFulfilled = async (row: ShopOrderRow) => {
    const next = !row.fulfilled;
    setItems(items.map((i) => (i === row ? { ...i, fulfilled: next } : i)));
    const res = await fetch(`/api/v1/admin/shop-orders/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfilled: next }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    } else {
      toast(next ? "Marked fulfilled." : "Marked unfulfilled.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-5">
        <EmptyState
          icon="tag"
          title="No shop orders yet"
          body="When someone buys an item on the Shop page, their order lands here."
        />
      </div>
    );
  }

  return (
    <div className="a-card mt-5 overflow-x-auto">
      <table className="a-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Fulfilled</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>
                <div className="font-semibold">{o.reference}</div>
                <div className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  {new Date(o.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </td>
              <td className="max-w-56">
                <div className="text-sm">{o.customer}</div>
                {o.deliveryNote && (
                  <div className="mt-1 text-xs italic" style={{ color: "var(--admin-ink-soft)" }}>
                    “{o.deliveryNote}”
                  </div>
                )}
              </td>
              <td className="text-sm">{o.items}</td>
              <td className="font-semibold">{formatNaira(o.total)}</td>
              <td>
                <span className={statusChip(o.status)}>{o.status}</span>
              </td>
              <td>
                <Toggle
                  checked={o.fulfilled}
                  onChange={() => void toggleFulfilled(o)}
                  label={o.fulfilled ? "Done" : "Pending"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
