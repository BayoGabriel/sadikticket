import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { adminOrderService } from "@/services/adminOrderService";
import { auditService } from "@/services/auditService";

// GET /api/v1/admin/orders/:orderId — full detail: order, tickets, event,
// payment, internal notes.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> },
) {
  try {
    await requirePermission("orders");
    const { orderId } = await ctx.params;
    const d = await adminOrderService.detail(orderId);
    return ok({
      order: { ...d.order, id: String(d.order._id) },
      tickets: d.tickets.map((t) => ({
        id: String(t._id),
        code: t.ticketCode,
        holderName: t.holderName,
        status: t.status,
        checkedInAt: t.checkedInAt,
        emailStatus: t.emailStatus,
        qrToken: t.qrToken,
        ticketTypeId: String(t.ticketTypeId),
      })),
      event: d.event
        ? { id: String(d.event._id), name: d.event.name, slug: d.event.slug, startsAt: d.event.startsAt, venueName: d.event.venueName, city: d.event.city }
        : null,
      payment: d.payment,
      typeNames: d.typeNames,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const patchSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  note: z.string().min(1).optional(),
});

// PATCH /api/v1/admin/orders/:orderId — edit buyer details and/or add a note.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await requirePermission("orders");
    const { orderId } = await ctx.params;
    const input = patchSchema.parse(await req.json());

    if (input.customerName || input.customerEmail || input.customerPhone !== undefined) {
      await adminOrderService.updateBuyer(
        orderId,
        { name: input.customerName, email: input.customerEmail, phone: input.customerPhone },
        user,
      );
    }
    if (input.note) await adminOrderService.addNote(orderId, input.note, user);
    await auditService.record({
      actor: user,
      action: "order.updated",
      entityType: "order",
      entityId: orderId,
    });
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
