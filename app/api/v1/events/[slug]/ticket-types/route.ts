import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { ticketTypeService } from "@/services/ticketTypeService";

// GET /api/v1/events/:slug/ticket-types (public, active and within sales window)
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const now = new Date();
    const { event, types } = await ticketTypeService.listPublicByEventSlug(slug);
    // A type with no sales window sells until the event ends.
    const eventEnd = event.endsAt ?? event.startsAt;
    return ok({
      items: types.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        description: t.description,
        price: t.price,
        currency: t.currency,
        quantityAvailable: Math.max(
          0,
          (t.quantity ?? 0) - (t.quantitySold ?? 0),
        ),
        salesStart: t.salesStart,
        salesEnd: t.salesEnd ?? eventEnd,
        isOnSale:
          (!t.salesStart || new Date(t.salesStart) <= now) &&
          new Date(t.salesEnd ?? eventEnd) >= now,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
