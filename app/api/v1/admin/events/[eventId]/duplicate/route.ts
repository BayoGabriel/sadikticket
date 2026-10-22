import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { adminEventService } from "@/services/adminEventService";
import { auditService } from "@/services/auditService";

// POST /api/v1/admin/events/:eventId/duplicate — copies everything (incl.
// ticket types) into a new draft.
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requirePermission("events");
    const { eventId } = await ctx.params;
    const copy = await adminEventService.duplicate(eventId, user.id);
    await auditService.record({
      actor: user,
      action: "event.duplicated",
      entityType: "event",
      entityId: String(copy._id),
      entityLabel: copy.name,
      detail: { from: eventId },
    });
    return ok({ id: String(copy._id), slug: copy.slug, name: copy.name }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
