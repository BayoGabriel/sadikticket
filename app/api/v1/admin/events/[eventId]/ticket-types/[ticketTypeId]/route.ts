import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { updateTicketTypeSchema } from "@/schemas/ticketType";
import { ticketTypeAdminService } from "@/services/ticketTypeAdminService";

// GET /api/v1/admin/events/:eventId/ticket-types/:ticketTypeId
// PATCH /api/v1/admin/events/:eventId/ticket-types/:ticketTypeId
// DELETE /api/v1/admin/events/:eventId/ticket-types/:ticketTypeId
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string; ticketTypeId: string }> },
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId, ticketTypeId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    const tt = await ticketTypeAdminService.get(eventId, ticketTypeId);
    return ok({
      id: tt._id.toString(),
      name: tt.name,
      description: tt.description,
      price: tt.price,
      currency: tt.currency,
      quantity: tt.quantity,
      quantitySold: tt.quantitySold,
      salesStart: tt.salesStart,
      salesEnd: tt.salesEnd,
      status: tt.status,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string; ticketTypeId: string }> },
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId, ticketTypeId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    const patch = updateTicketTypeSchema.parse(await req.json());
    const updated = await ticketTypeAdminService.update(
      eventId,
      ticketTypeId,
      patch,
    );
    return ok({ id: updated._id.toString(), updatedAt: updated.updatedAt });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string; ticketTypeId: string }> },
) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId, ticketTypeId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    await ticketTypeAdminService.remove(eventId, ticketTypeId);
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
