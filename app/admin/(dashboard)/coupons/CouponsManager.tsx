"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type CouponRow = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: string;
  expiresAt: string;
  usage: string;
  eventId: string;
  active: boolean;
};

const inputCls =
  "w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export function CouponsManager({
  initial,
  events,
}: {
  initial: CouponRow[];
  events: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<"percent" | "fixed">("percent");

  const toggle = async (id: string, active: boolean) => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setItems((xs) => xs.map((x) => (x.id === id ? { ...x, active } : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: String(fd.get("code") || "").toUpperCase(),
          kind: fd.get("kind"),
          // fixed amounts are entered in naira, stored in kobo
          value:
            Number(fd.get("value") || 0) * (fd.get("kind") === "fixed" ? 100 : 1),
          expiresAt: fd.get("expiresAt") || undefined,
          usageLimit: fd.get("usageLimit")
            ? Number(fd.get("usageLimit"))
            : undefined,
          eventId: fd.get("eventId") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          {adding ? "Close" : "New coupon"}
        </button>
        <a
          href="/api/v1/admin/coupons?format=csv"
          className="inline-flex items-center rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 font-medium hover:bg-[#F3F3F0]"
        >
          Export CSV
        </a>
      </div>

      {adding && (
        <form
          onSubmit={create}
          className="space-y-3 rounded-2xl border border-[#E8E8E5] bg-white p-5"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="code"
              required
              placeholder="CODE (e.g. VIBE10)"
              className={inputCls}
            />
            <select
              name="kind"
              className={inputCls}
              value={kind}
              onChange={(e) => setKind(e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <input
              name="value"
              required
              type="number"
              min="0"
              step="any"
              placeholder={kind === "percent" ? "Percent (e.g. 10)" : "Amount in ₦"}
              className={inputCls}
            />
            <div>
              <label className="text-xs text-[#6B6B6B]">Expires (optional)</label>
              <input name="expiresAt" type="date" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B]">Usage limit (optional)</label>
              <input
                name="usageLimit"
                type="number"
                min="1"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-[#6B6B6B]">Limit to event (optional)</label>
              <select name="eventId" className={inputCls} defaultValue="">
                <option value="">All events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Create coupon
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E5] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[#E8E8E5] text-sm text-[#6B6B6B]">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3 text-right">Active</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-b-0 border-[#E8E8E5] hover:bg-[#FAFAF8]"
              >
                <td className="px-4 py-3 font-mono text-sm font-semibold">
                  {c.code}
                </td>
                <td className="px-4 py-3 text-sm">{c.value}</td>
                <td className="px-4 py-3 text-sm">{c.usage}</td>
                <td className="px-4 py-3 text-sm">
                  {c.expiresAt
                    ? new Date(c.expiresAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {c.eventId === "global"
                    ? "All events"
                    : (events.find((e) => e.id === c.eventId)?.name ?? c.eventId)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={busy === c.id}
                    onClick={() => toggle(c.id, !c.active)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      c.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {c.active ? "Active" : "Off"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#6B6B6B]">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
