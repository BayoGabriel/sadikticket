import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { OrderModel } from "@/models/order";
import { WaitlistEntryModel } from "@/models/waitlistEntry";
import { TicketModel } from "@/models/ticket";
import { Types } from "mongoose";
import slugify from "slugify";
import { settingsService } from "@/services/settingsService";

export type AdminEventRow = {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  startsAt: Date;
  endsAt: Date;
  city?: string;
  venueName?: string;
  eventType?: string;
  tags: string[];
  status: Event["status"];
  scheduledPublishAt?: Date;
  capacity: number;
  sold: number;
  remaining: number;
  revenue: number; // kobo, paid orders only
  statusTag: string; // on-sale | few-left | sold-out | coming-soon
  waitlistCount: number;
};

// Sales status logic shared with the public site: override wins, else coming
// soon → on sale → few left → sold out.
export function computeStatusTag(opts: {
  override?: string | null;
  remaining: number;
  total: number;
  salesStart?: Date | null;
  threshold: number;
  now?: Date;
}) {
  if (opts.override) return opts.override;
  const now = opts.now ?? new Date();
  if (opts.salesStart && now < opts.salesStart) return "coming-soon";
  if (opts.total === 0) return "coming-soon";
  if (opts.remaining <= 0) return "sold-out";
  if (opts.remaining <= opts.threshold) return "few-left";
  return "on-sale";
}

export const adminEventService = {
  async list(params: {
    tab?: "upcoming" | "past" | "drafts" | "all";
    city?: string;
    eventType?: string;
    tag?: string;
    month?: string; // YYYY-MM
    status?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    page: number;
    limit: number;
  }) {
    await connectDb();
    const now = new Date();
    const query: Record<string, unknown> = { status: { $ne: "ARCHIVED" } };

    if (params.tab === "upcoming") {
      query.status = "PUBLISHED";
      query.startsAt = { $gte: now };
    } else if (params.tab === "past") {
      query.$or = [
        { startsAt: { $lt: now }, status: { $in: ["PUBLISHED", "COMPLETED", "CANCELLED"] } },
        { status: { $in: ["COMPLETED", "CANCELLED"] } },
      ];
    } else if (params.tab === "drafts") {
      query.status = "DRAFT";
    }
    if (params.city) query.city = params.city;
    if (params.eventType) query.eventType = params.eventType;
    if (params.tag) query.tags = params.tag;
    if (params.status && params.tab !== "drafts" && params.tab !== "upcoming" && params.tab !== "past")
      query.status = params.status;
    if (params.month) {
      const [y, m] = params.month.split("-").map(Number);
      if (y && m) {
        const from = new Date(Date.UTC(y, m - 1, 1));
        const to = new Date(Date.UTC(y, m, 1));
        query.startsAt = { $gte: from, $lt: to };
      }
    }
    if (params.search) {
      const rx = { $regex: params.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      query.$or = [{ name: rx }, { venueName: rx }, { slug: rx }];
    }

    const sortField =
      params.sort === "name" ? "name" : params.sort === "created" ? "createdAt" : "startsAt";
    const sortDir = params.order === "desc" ? -1 : 1;
    // upcoming sorts soonest-first; everything else newest-first
    const effectiveDir = params.sort ? sortDir : params.tab === "upcoming" ? 1 : -1;

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .sort({ [sortField]: effectiveDir })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean<Event[]>(),
      EventModel.countDocuments(query),
    ]);

    // Aggregate sold/revenue per event in one pass.
    const ids = events.map((e) => e._id);
    const [types, revenueByEvent, waitlistByEvent] = await Promise.all([
      TicketTypeModel.find({ eventId: { $in: ids } })
        .lean<{ eventId: Types.ObjectId; quantity: number; quantitySold: number; salesStart?: Date; status: string }[]>(),
      OrderModel.aggregate<{ _id: Types.ObjectId; revenue: number }>([
        { $match: { eventId: { $in: ids }, status: "PAID" } },
        { $group: { _id: "$eventId", revenue: { $sum: "$total" } } },
      ]),
      WaitlistEntryModel.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { eventId: { $in: ids }, status: "waiting" } },
        { $group: { _id: "$eventId", n: { $sum: 1 } } },
      ]),
    ]);

    const revenueMap = new Map(revenueByEvent.map((r) => [String(r._id), r.revenue]));
    const waitlistMap = new Map(waitlistByEvent.map((w) => [String(w._id), w.n]));
    const settings = await settingsService.getPublic();

    const rows: AdminEventRow[] = events.map((e) => {
      const ts = types.filter((t) => String(t.eventId) === String(e._id));
      const active = ts.filter((t) => t.status === "ACTIVE");
      const totalQty = active.reduce((a, t) => a + t.quantity, 0);
      const sold = active.reduce((a, t) => a + t.quantitySold, 0);
      const remaining = Math.max(0, totalQty - sold);
      const earliestStart = active
        .map((t) => t.salesStart)
        .filter(Boolean)
        .sort((a, b) => +new Date(a!) - +new Date(b!))[0];
      const threshold = e.fewLeftThreshold ?? settings.fewLeftThreshold;
      return {
        id: String(e._id),
        name: e.name,
        slug: e.slug,
        coverImage: e.coverImage ?? undefined,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        city: e.city ?? undefined,
        venueName: e.venueName ?? undefined,
        eventType: e.eventType ?? undefined,
        tags: e.tags ?? [],
        status: e.status,
        scheduledPublishAt: e.scheduledPublishAt ?? undefined,
        capacity: totalQty || e.capacity,
        sold,
        remaining,
        revenue: revenueMap.get(String(e._id)) ?? 0,
        statusTag:
          e.status !== "PUBLISHED"
            ? e.status === "DRAFT"
              ? "draft"
              : e.status.toLowerCase()
            : computeStatusTag({
                override: e.statusOverride,
                remaining,
                total: totalQty || e.capacity,
                salesStart: earliestStart,
                threshold,
              }),
        waitlistCount: waitlistMap.get(String(e._id)) ?? 0,
      };
    });

    return { items: rows, total, page: params.page, pages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  async stats(eventId: string) {
    await connectDb();
    const id = new Types.ObjectId(eventId);
    const [types, orders, waitlist, checkedIn] = await Promise.all([
      TicketTypeModel.find({ eventId: id }).lean(),
      OrderModel.aggregate<{ _id: string; n: number; revenue: number }>([
        { $match: { eventId: id } },
        { $group: { _id: "$status", n: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),
      WaitlistEntryModel.countDocuments({ eventId: id, status: "waiting" }),
      TicketModel.countDocuments({ eventId: id, status: "CHECKED_IN" }),
    ]);
    const byStatus = Object.fromEntries(orders.map((o) => [o._id ?? "UNKNOWN", o]));
    return {
      ticketTypes: types.map((t) => ({
        id: String(t._id),
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        quantitySold: t.quantitySold,
        status: t.status,
      })),
      paidOrders: byStatus.PAID?.n ?? 0,
      revenue: byStatus.PAID?.revenue ?? 0,
      pendingOrders: (byStatus.PENDING?.n ?? 0) + (byStatus.PAYMENT_PROCESSING?.n ?? 0),
      refundedOrders: byStatus.REFUNDED?.n ?? 0,
      waitlist,
      checkedIn,
      totalTickets: types.reduce((a, t) => a + t.quantitySold, 0),
    };
  },

  async duplicate(eventId: string, actorId: string) {
    await connectDb();
    const src = await EventModel.findById(eventId).lean<Event | null>();
    if (!src) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);

    const baseSlug = slugify(src.name, { lower: true, strict: true });
    let slug = `${baseSlug}-copy`;
    let n = 1;
    while (await EventModel.exists({ slug })) slug = `${baseSlug}-copy-${n++}`;

    const { _id, createdAt, updatedAt, ...rest } = src as Event & { createdAt: Date; updatedAt: Date };
    void _id; void createdAt; void updatedAt;
    const copy = await EventModel.create({
      ...rest,
      name: `${src.name} (copy)`,
      slug,
      status: "DRAFT",
      publishedAt: null,
      scheduledPublishAt: null,
      archivedAt: null,
      createdBy: new Types.ObjectId(actorId),
      seeded: false,
    });

    // Copy ticket types so the draft is ready to publish.
    const types = await TicketTypeModel.find({ eventId: src._id }).lean();
    if (types.length) {
      await TicketTypeModel.insertMany(
        types.map((raw) => {
          const t = { ...raw };
          delete t._id;
          delete t.createdAt;
          delete t.updatedAt;
          delete t.quantitySold;
          return { ...t, eventId: copy._id, quantitySold: 0 };
        }),
      );
    }
    return copy;
  },

  async archive(eventId: string) {
    await connectDb();
    const res = await EventModel.updateOne(
      { _id: eventId },
      { $set: { status: "ARCHIVED", archivedAt: new Date() } },
    );
    if (!res.matchedCount) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
  },

  // Refuses to delete when paid orders exist — the caller offers Archive instead.
  async removeGuarded(eventId: string) {
    await connectDb();
    const paidOrders = await OrderModel.countDocuments({
      eventId,
      status: { $in: ["PAID", "REFUNDED"] },
    });
    if (paidOrders > 0)
      throw new ApiError(
        "VALIDATION_ERROR",
        "This event has paid orders, so it can't be deleted. Archive it instead — it disappears from the site but the records stay.",
        400,
      );
    const res = await EventModel.deleteOne({ _id: eventId });
    if (!res.deletedCount) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    await TicketTypeModel.deleteMany({ eventId });
  },
};
