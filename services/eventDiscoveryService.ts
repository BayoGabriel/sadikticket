import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { Types } from "mongoose";

export type EventStatusTag =
  | "on-sale"
  | "few-left"
  | "sold-out"
  | "coming-soon";

export type PublicEventsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  range?: "today" | "week" | "month";
  city?: string;
  month?: string; // YYYY-MM
  tag?: string;
  type?: string; // eventType
  upcomingOnly?: boolean; // default true — hide past events
};

export type PublicEventItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  shortDescription?: string;
  city?: string;
  country?: string;
  venueName?: string;
  startsAt: string;
  fromPrice?: number;
  currency?: string;
  statusTag: EventStatusTag;
  tags?: string[];
  eventType?: string;
  statusOverride?: EventStatusTag | null;
};

export type PublicEventsResult = {
  items: PublicEventItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  months: string[]; // YYYY-MM months that have events — for filter pills
};

function emptyResult(page: number, limit: number): PublicEventsResult {
  return { items: [], page, limit, total: 0, totalPages: 0, months: [] };
}

// Show "Few tickets left" when remaining inventory is low.
const FEW_LEFT_THRESHOLD = 10;

async function attachTicketInfo(
  items: PublicEventItem[],
): Promise<PublicEventItem[]> {
  if (items.length === 0) return items;

  const now = new Date();
  const ids = items.map((i) => new Types.ObjectId(i.id));

  const rows = await TicketTypeModel.aggregate<{
    _id: Types.ObjectId;
    minPrice: number | null;
    futureMinPrice: number | null;
    currency: string | null;
    onSaleQty: number;
    onSaleSold: number;
    onSaleCount: number;
    futureCount: number;
  }>([
    { $match: { eventId: { $in: ids } } },
    {
      $project: {
        eventId: 1,
        price: 1,
        currency: 1,
        quantity: 1,
        quantitySold: 1,
        onSale: {
          $and: [
            { $eq: ["$status", "ACTIVE"] },
            {
              $or: [
                { $eq: ["$salesStart", null] },
                { $lte: ["$salesStart", now] },
              ],
            },
            {
              $or: [
                { $eq: ["$salesEnd", null] },
                { $gte: ["$salesEnd", now] },
              ],
            },
          ],
        },
        future: {
          $and: [
            { $eq: ["$status", "ACTIVE"] },
            { $gt: ["$salesStart", now] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$eventId",
        minPrice: {
          $min: { $cond: ["$onSale", "$price", null] },
        },
        futureMinPrice: {
          $min: { $cond: ["$future", "$price", null] },
        },
        currency: { $first: "$currency" },
        onSaleQty: { $sum: { $cond: ["$onSale", "$quantity", 0] } },
        onSaleSold: { $sum: { $cond: ["$onSale", "$quantitySold", 0] } },
        onSaleCount: { $sum: { $cond: ["$onSale", 1, 0] } },
        futureCount: { $sum: { $cond: ["$future", 1, 0] } },
      },
    },
  ]);

  const byEvent = new Map(rows.map((r) => [String(r._id), r]));

  return items.map((item) => {
    if (item.statusOverride) {
      return { ...item, statusTag: item.statusOverride };
    }
    const r = byEvent.get(item.id);
    if (!r || r.onSaleCount === 0) {
      return {
        ...item,
        statusTag: "coming-soon" as const,
        fromPrice: r?.futureMinPrice ?? undefined,
        currency: r?.currency ?? undefined,
      };
    }
    const remaining = r.onSaleQty - r.onSaleSold;
    const statusTag: EventStatusTag =
      remaining <= 0
        ? "sold-out"
        : remaining <= FEW_LEFT_THRESHOLD
          ? "few-left"
          : "on-sale";
    return {
      ...item,
      statusTag,
      fromPrice: r.minPrice ?? undefined,
      currency: r.currency ?? undefined,
    };
  });
}

export async function listPublicEvents(
  params: PublicEventsQuery,
): Promise<PublicEventsResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));

  try {
    await connectDb();
  } catch {
    // DB not configured/reachable — return empty quickly so pages render
    return emptyResult(page, limit);
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  if (params.range === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (params.range === "week") {
    end.setDate(end.getDate() + 7);
  } else if (params.range === "month") {
    end.setMonth(end.getMonth() + 1);
  }

  const query: Record<string, unknown> = { status: "PUBLISHED" };
  if (params.search) query.name = { $regex: params.search, $options: "i" };
  if (params.range) query.startsAt = { $gte: start, $lte: end };
  if (params.tag) query.tags = params.tag;
  if (params.type) query.eventType = params.type;
  // Upcoming events only by default
  if (params.upcomingOnly !== false && !params.range && !params.month) {
    query.startsAt = { $gte: now };
  }

  if (params.city) {
    query.city = {
      $regex: `^${params.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    };
  }

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    query.startsAt = {
      $gte: new Date(y, m - 1, 1),
      $lt: new Date(y, m, 1),
    };
  }

  try {
    const [items, total, monthRows] = await Promise.all([
      EventModel.find(query)
        .sort({ startsAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(query),
      EventModel.find({ status: "PUBLISHED", startsAt: { $gte: now } })
        .select("startsAt")
        .limit(200)
        .lean(),
    ]);

    const months = [
      ...new Set(
        monthRows.map((e) => e.startsAt.toISOString().slice(0, 7)),
      ),
    ].sort();

    const mapped: PublicEventItem[] = items.map((e) => ({
      id: String(e._id),
      name: e.name,
      slug: e.slug,
      coverImage: e.coverImage || null,
      shortDescription: e.shortDescription,
      city: e.city,
      country: e.country,
      venueName: e.venueName,
      startsAt: e.startsAt.toISOString(),
      tags: (e as { tags?: string[] }).tags ?? [],
      eventType: (e as { eventType?: string }).eventType,
      statusOverride: (e as { statusOverride?: EventStatusTag | null })
        .statusOverride,
      statusTag: "coming-soon",
    }));

    return {
      items: await attachTicketInfo(mapped),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      months,
    };
  } catch {
    return emptyResult(page, limit);
  }
}
