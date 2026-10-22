import { adminFetch } from "@/features/admin/api";

type OrderRow = {
  id: string;
  reference: string;
  event: string;
  customer: string;
  email: string;
  phone: string;
  items: string;
  checkoutAnswer: string;
  couponCode: string;
  discount: number;
  total: number;
  currency: string;
  status: string;
  createdAt: string;
};

const statusCls: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-red-50 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);

  let items: OrderRow[] = [];
  let loadError: string | null = null;
  try {
    const data = await adminFetch<{ items: OrderRow[] }>(
      `/api/v1/admin/orders${qs.size ? `?${qs}` : ""}`,
    );
    items = data.items;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load orders";
  }

  const csvHref = `/api/v1/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), format: "csv" })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-[#6B6B6B]">Ticket purchases across all events</p>
        </div>
        <a
          href={csvHref}
          className="inline-flex items-center rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 font-medium hover:bg-[#F3F3F0]"
        >
          Export CSV
        </a>
      </div>

      <form className="flex gap-3">
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button className="rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 hover:bg-[#F3F3F0]">
          Filter
        </button>
      </form>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E5] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[#E8E8E5] text-sm text-[#6B6B6B]">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr
                key={o.id}
                className="border-b last:border-b-0 border-[#E8E8E5] hover:bg-[#FAFAF8]"
              >
                <td className="px-4 py-3 text-sm font-mono">{o.reference}</td>
                <td className="px-4 py-3 text-sm">{o.event}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium">{o.customer}</div>
                  <div className="text-[#6B6B6B]">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">{o.items}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {o.currency === "NGN" ? "₦" : o.currency}
                  {o.total.toLocaleString()}
                  {o.discount > 0 && (
                    <div className="text-xs text-emerald-700">
                      −{o.currency === "NGN" ? "₦" : ""}
                      {o.discount.toLocaleString()} ({o.couponCode})
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusCls[o.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 && !loadError && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[#6B6B6B]">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
