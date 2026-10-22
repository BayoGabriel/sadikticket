import Link from "next/link";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { getAuthUser, normalizeRole } from "@/lib/auth";
import { dashboardService, parseRange } from "@/services/dashboardService";
import { formatNaira } from "@/lib/format";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { RangePicker } from "@/components/admin/dashboard/RangePicker";
import { SalesAreaChart, TicketsBarChart, CitySplit } from "@/components/admin/dashboard/Charts";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  "event.published": "published",
  "event.created": "created",
  "event.updated": "edited",
  "event.duplicated": "duplicated",
  "event.archived": "archived",
  "event.deleted": "deleted",
  "order.refunded": "refunded an order on",
  "order.manual-sale": "added a manual sale for",
  "coupon.created": "created a coupon on",
  "enquiry.stage-changed": "moved an enquiry about",
  "settings.updated": "updated settings",
  "team.invited": "invited a teammate for",
  "waitlist.notified": "notified the waitlist for",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const me = await getAuthUser();
  if (!me) redirect("/admin/login");
  // Door staff get a stripped-down home: straight to check-in.
  if (normalizeRole(me.role) === "DOOR_STAFF") redirect("/admin/check-in");

  const sp = await searchParams;
  const range = parseRange({ range: sp.range, from: sp.from, to: sp.to });
  const data = await dashboardService.get(range, me.name);

  return (
    <div>
      <PageHeader
        title={`${new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, ${data.userName.split(" ")[0]}.`}
        subtitle={format(new Date(), "EEEE d MMMM yyyy") + " — here's how things are looking."}
      >
        <RangePicker />
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {data.kpis.map((k) => (
          <div key={k.key} className="a-card p-4">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--admin-ink-soft)" }}>
              {k.label}
            </p>
            <p className="admin-title mt-1.5 text-2xl font-extrabold">
              {k.format === "money" ? formatNaira(k.value) : k.value.toLocaleString()}
            </p>
            {k.key !== "waitlist" && (
              <p className="mt-1 text-xs font-semibold" style={{ color: k.change >= 0 ? "var(--green-2)" : "var(--admin-red)" }}>
                {k.change >= 0 ? "▲" : "▼"} {Math.abs(k.change)}% vs previous
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="a-card p-5 xl:col-span-2">
          <h2 className="admin-title mb-3 text-base font-bold">Sales over time</h2>
          <SalesAreaChart series={data.series} />
        </div>
        <div className="a-card p-5">
          <h2 className="admin-title mb-3 text-base font-bold">Where the money&apos;s coming from</h2>
          <CitySplit cities={data.cities} />
          <h2 className="admin-title mb-3 mt-6 text-base font-bold">Tickets by event</h2>
          <TicketsBarChart data={data.ticketsByEvent} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* Upcoming events */}
        <div className="a-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="admin-title text-base font-bold">Coming up</h2>
            <Link href="/admin/events" className="text-sm font-bold" style={{ color: "var(--green)" }}>
              All events →
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm" style={{ color: "var(--admin-ink-soft)" }}>
              Nothing on the calendar yet.{" "}
              <Link href="/admin/events/new" className="font-bold underline" style={{ color: "var(--orange)" }}>
                Let&apos;s put something fun on it.
              </Link>
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--admin-line)" }}>
              {data.upcoming.map((e) => (
                <li key={e.id} className="flex items-center gap-4 py-3">
                  <div
                    className="flex h-11 w-11 flex-none flex-col items-center justify-center rounded-xl text-center"
                    style={{ background: "var(--mint)", color: "var(--green)" }}
                  >
                    <span className="text-sm font-extrabold leading-none">{format(new Date(e.startsAt), "d")}</span>
                    <span className="text-[0.6rem] font-bold uppercase">{format(new Date(e.startsAt), "MMM")}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/events/${e.id}`} className="block truncate text-sm font-bold hover:underline">
                      {e.name}
                    </Link>
                    <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                      {e.city} · {format(new Date(e.startsAt), "EEE d MMM, h:mma")}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="a-progress w-28">
                        <span style={{ width: `${e.capacity ? Math.min(100, (e.sold / e.capacity) * 100) : 0}%` }} />
                      </div>
                      <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                        {e.sold}/{e.capacity} sold
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1.5">
                    <StatusChip status={e.statusTag} />
                    <div className="flex gap-1">
                      <Link href={`/admin/check-in?event=${e.id}`} className="a-btn a-btn-ghost a-btn-sm" title="Check in guests">
                        <Icon name="scan" size={15} />
                      </Link>
                      <Link href={`/events/${e.slug}`} target="_blank" className="a-btn a-btn-ghost a-btn-sm" title="Open on site">
                        <Icon name="external" size={15} />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {/* Needs attention */}
          <div className="a-card p-5">
            <h2 className="admin-title mb-3 text-base font-bold">Needs attention</h2>
            {data.attention.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
                All clear — nothing&apos;s waiting on you.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.attention.map((a) => (
                  <li key={a.id}>
                    <Link href={a.href} className="flex items-start gap-2.5 text-sm hover:underline">
                      <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: "var(--orange)" }} />
                      {a.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick actions */}
          <div className="a-card p-5">
            <h2 className="admin-title mb-3 text-base font-bold">Quick actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/events/new" className="a-btn a-btn-orange a-btn-sm"><Icon name="plus" size={14} /> New event</Link>
              <Link href="/admin/orders?new=manual" className="a-btn a-btn-outline a-btn-sm"><Icon name="ticket" size={14} /> Manual sale</Link>
              <Link href="/admin/check-in" className="a-btn a-btn-outline a-btn-sm"><Icon name="scan" size={14} /> Check in</Link>
              <Link href="/admin/enquiries" className="a-btn a-btn-outline a-btn-sm"><Icon name="inbox" size={14} /> Enquiries</Link>
            </div>
          </div>

          {/* Activity feed */}
          <div className="a-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="admin-title text-base font-bold">Recent activity</h2>
              <Link href="/admin/activity" className="text-xs font-bold" style={{ color: "var(--green)" }}>All →</Link>
            </div>
            {data.recent.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {data.recent.slice(0, 8).map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-semibold">{r.actor}</span>{" "}
                    <span style={{ color: "var(--admin-ink-soft)" }}>
                      {ACTION_LABELS[r.action] ?? r.action}
                    </span>{" "}
                    {r.entityLabel && <span className="font-semibold">{r.entityLabel}</span>}
                    <span className="block text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
