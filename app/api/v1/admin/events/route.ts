import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import {
  createEventSchema,
  paginationQuerySchema,
  updateEventSchema,
} from "@/schemas/event";
import { eventService } from "@/services/eventService";

// POST /api/v1/admin/events  (create)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const json = await req.json();
    const input = createEventSchema.parse(json);
    const created = await eventService.create({
      ...input,
      createdById: user.id,
    });
    return ok({
      id: created._id.toString(),
      name: created.name,
      slug: created.slug,
      status: created.status,
      createdAt: created.createdAt,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// GET /api/v1/admin/events  (list with pagination & filters)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { searchParams } = new URL(req.url);
    const parsed = paginationQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search") ?? undefined,
      status: (searchParams.get("status") as any) ?? undefined,
      sort: (searchParams.get("sort") as any) ?? undefined,
      order: (searchParams.get("order") as any) ?? undefined,
    });

    const { items, total } = await eventService.list(parsed);
    return ok({
      items: items.map((e) => ({
        id: e._id.toString(),
        name: e.name,
        slug: e.slug,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        status: e.status,
        createdAt: e.createdAt,
      })),
      page: parsed.page,
      limit: parsed.limit,
      total,
      totalPages: Math.ceil(total / parsed.limit),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
