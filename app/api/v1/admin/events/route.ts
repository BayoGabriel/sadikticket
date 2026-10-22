import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { eventEditorSchema } from "@/schemas/event";
import { eventService } from "@/services/eventService";
import { adminEventService } from "@/services/adminEventService";
import { auditService } from "@/services/auditService";
import { ticketTypeAdminService } from "@/services/ticketTypeAdminService";
import { revalidatePublicSite } from "@/lib/revalidate";

// POST /api/v1/admin/events — create event + ticket types in one payload.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("events");
    const json = await req.json();
    const input = eventEditorSchema.parse(json);
    const { ticketTypes, slug, ...eventInput } = input;

    const created = await eventService.create({
      ...eventInput,
      slug,
      createdById: user.id,
    });

    if (ticketTypes?.length) {
      for (const tt of ticketTypes) {
        if (tt.remove) continue;
        await ticketTypeAdminService.create(String(created._id), {
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

    await auditService.record({
      actor: user,
      action: "event.created",
      entityType: "event",
      entityId: String(created._id),
      entityLabel: created.name,
    });
    revalidatePublicSite(created.slug);
    return ok({ id: created._id.toString(), slug: created.slug }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// GET /api/v1/admin/events — rich list with sold/capacity/revenue/status.
export async function GET(req: NextRequest) {
  try {
    await requirePermission("events");
    const sp = req.nextUrl.searchParams;
    const result = await adminEventService.list({
      tab: (sp.get("tab") as "upcoming" | "past" | "drafts" | "all") || "upcoming",
      city: sp.get("city") || undefined,
      eventType: sp.get("type") || undefined,
      tag: sp.get("tag") || undefined,
      month: sp.get("month") || undefined,
      status: sp.get("status") || undefined,
      search: sp.get("search") || undefined,
      sort: sp.get("sort") || undefined,
      order: (sp.get("order") as "asc" | "desc") || undefined,
      page: Math.max(1, Number(sp.get("page") || 1)),
      limit: Math.min(100, Number(sp.get("limit") || 20)),
    });
    return ok(result);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
