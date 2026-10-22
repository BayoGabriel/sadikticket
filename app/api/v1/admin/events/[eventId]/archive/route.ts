import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { adminEventService } from "@/services/adminEventService";
import { eventService } from "@/services/eventService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

// POST /api/v1/admin/events/:eventId/archive
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requirePermission("events");
    const { eventId } = await ctx.params;
    const ev = await eventService.getById(eventId);
    await adminEventService.archive(eventId);
    await auditService.record({
      actor: user,
      action: "event.archived",
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
