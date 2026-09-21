import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";

export type PublicEventsQuery = {
  search?: string;
  page?: number;
  limit?: number;
  range?: "today" | "week" | "month";
};

export type PublicEventsResult = {
  items: {
    id: string;
    name: string;
    slug: string;
    coverImage: string | null;
    city?: string;
    country?: string;
    venueName?: string;
    startsAt: string;
  }[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function emptyResult(page: number, limit: number): PublicEventsResult {
  return { items: [], page, limit, total: 0, totalPages: 0 };
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

  try {
    const [items, total] = await Promise.all([
      EventModel.find(query)
        .sort({ startsAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      EventModel.countDocuments(query),
    ]);

    return {
      items: items.map((e) => ({
        id: String(e._id),
        name: e.name,
        slug: e.slug,
        coverImage: e.coverImage || null,
        city: e.city,
        country: e.country,
        venueName: e.venueName,
        startsAt: e.startsAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return emptyResult(page, limit);
  }
}
