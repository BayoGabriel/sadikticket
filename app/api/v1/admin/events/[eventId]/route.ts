import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { eventEditorSchema } from "@/schemas/event";
import { eventService } from "@/services/eventService";
import { adminEventService } from "@/services/adminEventService";
import { auditService } from "@/services/auditService";
import { ticketTypeAdminService } from "@/services/ticketTypeAdminService";
import { revalidatePublicSite } from "@/lib/revalidate";
import slugify from "slugify";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";

// GET /api/v1/admin/events/:eventId — full record for the editor.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    await requirePermission("events");
    const { eventId } = await ctx.params;
    const ev = await eventService.getById(eventId);
    return ok({ ...ev, id: String(ev._id) });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// PATCH /api/v1/admin/events/:eventId — save the whole editor payload
// (event fields + ticket types) in one round-trip.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requirePermission("events");
    const { eventId } = await ctx.params;
    const parsed = eventEditorSchema.partial().parse(await req.json());
    const { ticketTypes, slug, status, ...patch } = parsed;

    // Edited slugs must stay unique.
    if (slug) {
      await connectDb();
      const wanted = slugify(slug, { lower: true, strict: true });
      const clash = await EventModel.exists({ slug: wanted, _id: { $ne: eventId } });
      if (!clash) {
        await EventModel.updateOne({ _id: eventId }, { $set: { slug: wanted } });
      }
    }

    const updated = await eventService.update(eventId, { ...patch, status });

    if (ticketTypes) {
      for (const tt of ticketTypes) {
        if (tt.id && tt.remove) {
          await ticketTypeAdminService.remove(eventId, tt.id);
        } else if (tt.id) {
          // Block shrinking capacity below what's already sold.
          const existing = await ticketTypeAdminService.get(eventId, tt.id);
          if (tt.quantity < existing.quantitySold)
            throw new Error(
              `“${tt.name}” already has ${existing.quantitySold} sold — capacity can't go below that.`,
            );
          await ticketTypeAdminService.update(eventId, tt.id, {
            name: tt.name,
            description: tt.description,
            price: Math.round(tt.priceNaira * 100),
            quantity: tt.quantity,
            maxPerOrder: tt.maxPerOrder ?? undefined,
            salesStart: tt.salesStart ? new Date(tt.salesStart) : null,
            salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : null,
            status: tt.status,
          });
        } else if (!tt.remove) {
          await ticketTypeAdminService.create(eventId, {
            name: tt.name,
            description: tt.description,
            price: Math.round(tt.priceNaira * 100),
            currency: "NGN",
            quantity: tt.quantity,
            maxPerOrder: tt.maxPerOrder ?? undefined,
            salesStart: tt.salesStart ? new Date(tt.salesStart) : undefined,
            salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : undefined,
            status: tt.status,
          });
        }
      }
    }

    await auditService.record({
      actor: user,
      action: status === "PUBLISHED" ? "event.published" : "event.updated",
      entityType: "event",
      entityId: eventId,
      entityLabel: updated.name,
    });
    revalidatePublicSite(updated.slug);
    return ok({ id: String(updated._id), slug: updated.slug, status: updated.status, updatedAt: updated.updatedAt });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// DELETE /api/v1/admin/events/:eventId — blocked while paid orders exist.
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requirePermission("events");
    const { eventId } = await ctx.params;
    const ev = await eventService.getById(eventId);
    await adminEventService.removeGuarded(eventId);
    await auditService.record({
      actor: user,
      action: "event.deleted",
      entityType: "event",
      entityId: eventId,
      entityLabel: ev.name,
    });
    revalidatePublicSite(ev.slug);
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
