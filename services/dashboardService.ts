import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { EnquiryModel } from "@/models/enquiry";
import { SubscriberModel } from "@/models/subscriber";
import { WaitlistEntryModel } from "@/models/waitlistEntry";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { auditService } from "@/services/auditService";
import { settingsService } from "@/services/settingsService";
import { Types } from "mongoose";

export type DashboardRange = { from: Date; to: Date; prevFrom: Date; prevTo: Date };

export function parseRange(params: { range?: string; from?: string; to?: string }): DashboardRange {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let from: Date;
  let to = endOfToday;
  if (params.range === "today") {
    from = new Date(now);
    from.setHours(0, 0, 0, 0);
  } else if (params.range === "30d") {
    from = new Date(now.getTime() - 29 * 864e5);
    from.setHours(0, 0, 0, 0);
  } else if (params.range === "custom" && params.from && params.to) {
    from = new Date(params.from);
    to = new Date(params.to);
    to.setHours(23, 59, 59, 999);
    if (isNaN(+from) || isNaN(+to)) {
      from = new Date(now.getTime() - 6 * 864e5);
      from.setHours(0, 0, 0, 0);
      to = endOfToday;
    }
  } else {
    // default: last 7 days
    from = new Date(now.getTime() - 6 * 864e5);
    from.setHours(0, 0, 0, 0);
  }
  const span = to.getTime() - from.getTime() + 1;
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - span + 1);
  return { from, to, prevFrom, prevTo };
}

function pctChange(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

export const dashboardService = {
  async get(range: DashboardRange, userName: string) {
    await connectDb();
    const { from, to, prevFrom, prevTo } = range;

    const [
      curAgg,
      prevAgg,
      newEnquiries,
      prevEnquiries,
      newSubscribers,
      prevSubscribers,
      waitlistTotal,
      salesSeries,
      ticketsByEvent,
      cityAgg,
      events,
    ] = await Promise.all([
      OrderModel.aggregate<{ _id: null; revenue: number; orders: number; tickets: number }>([
        { $match: { status: "PAID", updatedAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            tickets: { $sum: { $sum: "$items.quantity" } },
          },
        },
      ]),
      OrderModel.aggregate<{ _id: null; revenue: number; orders: number; tickets: number }>([
        { $match: { status: "PAID", updatedAt: { $gte: prevFrom, $lte: prevTo } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            tickets: { $sum: { $sum: "$items.quantity" } },
          },
        },
      ]),
      EnquiryModel.countDocuments({
        kind: { $in: ["private-booking", "business", "general"] },
        stage: { $ne: "spam" },
        createdAt: { $gte: from, $lte: to },
      }),
      EnquiryModel.countDocuments({
        kind: { $in: ["private-booking", "business", "general"] },
        stage: { $ne: "spam" },
        createdAt: { $gte: prevFrom, $lte: prevTo },
      }),
      SubscriberModel.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      SubscriberModel.countDocuments({ createdAt: { $gte: prevFrom, $lte: prevTo } }),
      WaitlistEntryModel.countDocuments({ status: "waiting" }),
      // daily sales series in range
      OrderModel.aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: { status: "PAID", updatedAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // tickets sold per event in range
      OrderModel.aggregate<{ _id: Types.ObjectId; tickets: number; revenue: number }>([
        { $match: { status: "PAID", updatedAt: { $gte: from, $lte: to } } },
        { $unwind: "$items" },
        { $group: { _id: "$eventId", tickets: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.unitPrice", "$items.quantity"] } } } },
        { $sort: { tickets: -1 } },
        { $limit: 6 },
      ]),
      OrderModel.aggregate<{ _id: Types.ObjectId; revenue: number; orders: number }>([
        { $match: { status: "PAID", updatedAt: { $gte: from, $lte: to } } },
        { $group: { _id: "$eventId", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
      EventModel.find({}).select("name city status startsAt coverImage capacity slug statusOverride fewLeftThreshold").lean<Event[]>(),
    ]);

    const cur = curAgg[0] ?? { revenue: 0, orders: 0, tickets: 0 };
    const prev = prevAgg[0] ?? { revenue: 0, orders: 0, tickets: 0 };

    // event name lookup for ticketsByEvent + city split
    const eventById = new Map(events.map((e) => [String(e._id), e]));
    const ticketsSeries = ticketsByEvent.map((t) => ({
      name: eventById.get(String(t._id))?.name ?? "Unknown",
      tickets: t.tickets,
      revenue: t.revenue,
    }));
    const cities = { Lagos: 0, "Benin City": 0, other: 0 };
    for (const row of cityAgg) {
      const ev = eventById.get(String(row._id));
      const city = ev?.city === "Benin City" ? "Benin City" : ev?.city === "Lagos" ? "Lagos" : "other";
      cities[city as keyof typeof cities] += row.revenue;
    }

    // Fill missing days in the sales series
    const series: { day: string; revenue: number; orders: number }[] = [];
    const byDay = new Map(salesSeries.map((s) => [s._id, s]));
    for (let d = new Date(from); d <= to; d = new Date(d.getTime() + 864e5)) {
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key);
      series.push({ day: key, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 });
    }

    // Upcoming events with sold/capacity + waitlist
    const upcomingEvents = events
      .filter((e) => e.status === "PUBLISHED" && new Date(e.startsAt) >= new Date())
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
      .slice(0, 6);
    const upcomingIds = upcomingEvents.map((e) => e._id);
    const [types, waitlistCounts] = await Promise.all([
      TicketTypeModel.find({ eventId: { $in: upcomingIds } }).lean(),
      WaitlistEntryModel.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { eventId: { $in: upcomingIds }, status: "waiting" } },
        { $group: { _id: "$eventId", n: { $sum: 1 } } },
      ]),
    ]);
    const waitlistMap = new Map(waitlistCounts.map((w) => [String(w._id), w.n]));
    const settings = await settingsService.getPublic();
    const upcoming = upcomingEvents.map((e) => {
      const ts = types.filter((t) => String(t.eventId) === String(e._id) && t.status === "ACTIVE");
      const cap = ts.reduce((a, t) => a + t.quantity, 0) || e.capacity;
      const sold = ts.reduce((a, t) => a + t.quantitySold, 0);
      return {
        id: String(e._id),
        name: e.name,
        slug: e.slug,
        city: e.city,
        startsAt: e.startsAt,
        coverImage: e.coverImage,
        capacity: cap,
        sold,
        waitlist: waitlistMap.get(String(e._id)) ?? 0,
        statusTag: "",
      };
    });
    // compute statusTag via shared logic
    const upcomingWithStatus = upcoming.map((u) => {
      const e = upcomingEvents.find((x) => String(x._id) === u.id)!;
      return {
        ...u,
        statusTag: e.statusOverride
          ? e.statusOverride
          : u.capacity - u.sold <= 0
            ? "sold-out"
            : u.capacity - u.sold <= (e.fewLeftThreshold ?? settings.fewLeftThreshold)
              ? "few-left"
              : "on-sale",
      };
    });

    // Needs attention
    const attention: { id: string; text: string; href: string }[] = [];
    const dayMs = 864e5;
    for (const e of upcomingWithStatus) {
      if (e.statusTag === "few-left")
        attention.push({ id: `few-${e.id}`, text: `"${e.name}" is nearly sold out — ${e.capacity - e.sold} left`, href: `/admin/events/${e.id}` });
      if (e.statusTag === "sold-out" && e.waitlist > 0)
        attention.push({ id: `wl-${e.id}`, text: `"${e.name}" is sold out with ${e.waitlist} waiting`, href: `/admin/waitlist` });
      if (!e.coverImage)
        attention.push({ id: `img-${e.id}`, text: `"${e.name}" has no photo yet`, href: `/admin/events/${e.id}/edit` });
      if (e.capacity === 0)
        attention.push({ id: `tk-${e.id}`, text: `"${e.name}" has no ticket types set`, href: `/admin/events/${e.id}` });
      const daysOut = (+new Date(e.startsAt) - Date.now()) / dayMs;
      if (daysOut < 7 && daysOut > 0)
        attention.push({ id: `soon-${e.id}`, text: `"${e.name}" is in ${Math.ceil(daysOut)} day${Math.ceil(daysOut) === 1 ? "" : "s"}`, href: `/admin/events/${e.id}` });
    }
    const [staleEnquiries, pendingPayments, draftNoImage] = await Promise.all([
      EnquiryModel.countDocuments({
        kind: { $in: ["private-booking", "business", "general"] },
        stage: "new",
        createdAt: { $lt: new Date(Date.now() - 24 * 3600e3) },
      }),
      OrderModel.countDocuments({ status: { $in: ["PENDING", "PAYMENT_PROCESSING"] } }),
      Promise.resolve(0),
    ]);
    void draftNoImage;
    if (staleEnquiries > 0)
      attention.unshift({ id: "stale-enquiries", text: `${staleEnquiries} ${staleEnquiries === 1 ? "enquiry is" : "enquiries are"} waiting over a day`, href: "/admin/enquiries" });
    if (pendingPayments > 0)
      attention.push({ id: "pending-payments", text: `${pendingPayments} ${pendingPayments === 1 ? "payment is" : "payments are"} still pending`, href: "/admin/orders?status=PENDING" });

    const recent = await auditService.recent(12);

    return {
      userName,
      kpis: [
        { key: "revenue", label: "Revenue", value: cur.revenue, change: pctChange(cur.revenue, prev.revenue), format: "money" },
        { key: "tickets", label: "Tickets sold", value: cur.tickets, change: pctChange(cur.tickets, prev.tickets), format: "number" },
        { key: "orders", label: "Orders", value: cur.orders, change: pctChange(cur.orders, prev.orders), format: "number" },
        { key: "enquiries", label: "New enquiries", value: newEnquiries, change: pctChange(newEnquiries, prevEnquiries), format: "number" },
        { key: "subscribers", label: "New subscribers", value: newSubscribers, change: pctChange(newSubscribers, prevSubscribers), format: "number" },
        { key: "waitlist", label: "On waitlists", value: waitlistTotal, change: 0, format: "number" },
      ],
      series,
      ticketsByEvent: ticketsSeries,
      cities,
      attention: attention.slice(0, 8),
      upcoming: upcomingWithStatus,
      recent: recent.map((r) => ({
        id: String(r._id),
        actor: r.actorName || r.actorEmail || "System",
        action: r.action,
        entityLabel: r.entityLabel,
        createdAt: r.createdAt,
      })),
    };
  },
};
