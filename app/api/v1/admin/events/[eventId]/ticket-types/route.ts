import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { createTicketTypeSchema } from "@/schemas/ticketType";
import { ticketTypeAdminService } from "@/services/ticketTypeAdminService";

// POST /api/v1/admin/events/:eventId/ticket-types
// GET  /api/v1/admin/events/:eventId/ticket-types
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    const input = createTicketTypeSchema.parse(await req.json());
    const created = await ticketTypeAdminService.create(eventId, input);
    return ok({ id: created._id.toString() });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || "20")),
    );
    const { items, total } = await ticketTypeAdminService.list(
      eventId,
      page,
      limit,
    );
    return ok({
      items: items.map((t: any) => ({
        id: t._id.toString(),
        name: t.name,
        description: t.description,
        price: t.price,
        currency: t.currency,
        quantity: t.quantity,
        quantitySold: t.quantitySold,
        salesStart: t.salesStart,
        salesEnd: t.salesEnd,
        status: t.status,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
