import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { waitlistService } from "@/services/waitlistService";
import { auditService } from "@/services/auditService";

// POST /api/v1/admin/events/[eventId]/notify-waitlist { count? }
// Emails people waiting on this event that a spot freed up.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    const user = await requirePermission("events");
    const { eventId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const r = await waitlistService.notify(eventId, body.count);
    await auditService.record({
      actor: user,
      action: "waitlist.notified",
      entityType: "event",
      entityId: eventId,
      detail: { count: r.notified },
    });
    return ok(r);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
