import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { eventService } from "@/services/eventService";
import { adminEventService } from "@/services/adminEventService";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { TicketModel } from "@/models/ticket";
import { WaitlistEntryModel } from "@/models/waitlistEntry";
import { formatNaira } from "@/lib/format";
import { PageHeader, Breadcrumbs } from "@/components/admin/ui/PageHeader";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";

export const dynamic = "force-dynamic";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  await connectDb();
  const [event, stats, recentOrders, waiters] = await Promise.all([
    eventService.getById(eventId).catch(() => null),
    adminEventService.stats(eventId).catch(() => null),
    OrderModel.find({ eventId }).sort({ createdAt: -1 }).limit(6).lean().catch(() => []),
    WaitlistEntryModel.find({ eventId, status: "waiting" }).sort({ createdAt: 1 }).limit(5).lean().catch(() => []),
  ]);
  if (!event || !stats) notFound();

  const published = event.status === "PUBLISHED";
  const totalCapacity = stats.ticketTypes.reduce((a, t) => a + t.quantity, 0);
  const totalSold = stats.ticketTypes.reduce((a, t) => a + t.quantitySold, 0);
  const pct = totalCapacity ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const checkedInTickets = stats.checkedIn;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Events", href: "/admin/events" }, { label: event.name }]} />
      <PageHeader title={event.name} subtitle={`${format(new Date(event.startsAt), "EEEE d MMMM yyyy · h:mma")} · ${event.venueName ?? ""} · ${event.city ?? ""}`}>
        {event.slug && (
          <Link href={`/events/${event.slug}`} target="_blank" className="a-btn a-btn-ghost">
            <Icon name="external" size={15} /> View on site
          </Link>
        )}
        <Link href={`/admin/orders?event=${eventId}`} className="a-btn a-btn-outline">
          <Icon name="ticket" size={15} /> Orders
        </Link>
        <Link href={`/admin/check-in?event=${eventId}`} className="a-btn a-btn-outline">
          <Icon name="scan" size={15} /> Check in
        </Link>
        <Link href={`/admin/events/${eventId}/edit`} className="a-btn a-btn-orange">
          <Icon name="edit" size={15} /> Edit
        </Link>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Sales summary */}
        <div className="a-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="admin-title text-base font-bold">Sales</h2>
            <StatusChip status={event.status} />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="a-progress flex-1">
              <span style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-bold">
              {totalSold}/{totalCapacity} · {pct}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Revenue", value: formatNaira(stats.revenue) },
              { label: "Paid orders", value: stats.paidOrders },
              { label: "Tickets out", value: stats.totalTickets },
              { label: "Checked in", value: checkedInTickets },
            ].map((m) => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: "var(--admin-canvas)" }}>
                <p className="text-xs font-bold" style={{ color: "var(--admin-ink-soft)" }}>{m.label}</p>
                <p className="admin-title mt-0.5 text-xl font-extrabold">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Per ticket type */}
          <h3 className="admin-title mb-2 mt-6 text-sm font-bold">By ticket type</h3>
          <div className="a-card overflow-hidden">
            <table className="a-table">
              <thead>
                <tr><th>Ticket</th><th>Price</th><th>Sold</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.ticketTypes.map((t) => (
                  <tr key={t.id}>
                    <td className="font-semibold">{t.name}</td>
                    <td>{formatNaira(t.price)}</td>
                    <td>{t.quantitySold}/{t.quantity}</td>
                    <td><StatusChip status={t.status === "ACTIVE" ? (t.quantitySold >= t.quantity ? "sold-out" : "active") : "inactive"} /></td>
                  </tr>
                ))}
                {!stats.ticketTypes.length && (
                  <tr><td colSpan={4} style={{ color: "var(--admin-ink-soft)" }}>No ticket types yet — <Link href={`/admin/events/${eventId}/edit`} className="font-bold underline">add some in the editor</Link>.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Waitlist */}
          <div className="a-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="admin-title text-base font-bold">Waitlist</h2>
              <Link href={`/admin/waitlist?event=${eventId}`} className="text-xs font-bold" style={{ color: "var(--green)" }}>Manage →</Link>
            </div>
            {stats.waitlist === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>Nobody waiting right now.</p>
            ) : (
              <>
                <p className="text-sm font-bold">{stats.waitlist} {stats.waitlist === 1 ? "person is" : "people are"} hoping for a ticket</p>
                <ul className="mt-2 space-y-1 text-sm" style={{ color: "var(--admin-ink-soft)" }}>
                  {waiters.map((w) => <li key={String(w._id)}>· {w.name || w.email}</li>)}
                  {stats.waitlist > 5 && <li>…and {stats.waitlist - 5} more</li>}
                </ul>
              </>
            )}
          </div>

          {/* Pending */}
          {stats.pendingOrders > 0 && (
            <div className="a-card p-5" style={{ background: "var(--admin-amber-bg)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--admin-amber)" }}>
                {stats.pendingOrders} {stats.pendingOrders === 1 ? "payment is" : "payments are"} still pending
              </p>
              <Link href={`/admin/orders?event=${eventId}&status=PENDING`} className="mt-1 inline-block text-sm font-bold underline" style={{ color: "var(--admin-amber)" }}>
                Check them →
              </Link>
            </div>
          )}

          {/* Quick info */}
          <div className="a-card p-5 text-sm">
            <h2 className="admin-title mb-3 text-base font-bold">Details</h2>
            <dl className="space-y-2.5">
              {[
                ["Status", published ? "Published" : event.status === "DRAFT" ? "Draft" : event.status],
                ["Doors open", event.doorsOpenAt ? format(new Date(event.doorsOpenAt), "h:mma") : "—"],
                ["Ends", event.endsAt ? format(new Date(event.endsAt), "h:mma") : "—"],
                ["Type", event.eventType || "—"],
                ["Tags", event.tags?.join(", ") || "—"],
                ["Link", `/events/${event.slug}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt style={{ color: "var(--admin-ink-soft)" }}>{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="a-card mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="admin-title text-base font-bold">Recent orders</h2>
          <Link href={`/admin/orders?event=${eventId}`} className="text-xs font-bold" style={{ color: "var(--green)" }}>All orders →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            No orders yet — share the link and watch this fill up.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead><tr><th>Buyer</th><th>Tickets</th><th>Total</th><th>Status</th><th>When</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={String(o._id)}>
                    <td>
                      <Link href={`/admin/orders/${o._id}`} className="font-semibold hover:underline">{o.customerName}</Link>
                      <span className="block text-xs" style={{ color: "var(--admin-ink-soft)" }}>{o.customerEmail}</span>
                    </td>
                    <td>{o.items.map((i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`).join(", ")}</td>
                    <td className="font-semibold">{formatNaira(o.total)}</td>
                    <td><StatusChip status={o.status} /></td>
                    <td className="whitespace-nowrap text-xs" style={{ color: "var(--admin-ink-soft)" }}>{format(new Date(o.createdAt), "d MMM, h:mma")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
