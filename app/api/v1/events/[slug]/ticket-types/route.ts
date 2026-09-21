import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { ticketTypeService } from "@/services/ticketTypeService";

// GET /api/v1/events/:slug/ticket-types (public, active and within sales window)
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { types } = await ticketTypeService.listPublicByEventSlug(
      params.slug,
    );
    return ok({
      items: types.map((t: any) => ({
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
        salesEnd: t.salesEnd,
      })),
    });
  } catch (e: any) {
    return fail(e);
  }
}
