import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { adminEventService } from "@/services/adminEventService";

// GET /api/v1/admin/events/:eventId/stats — sales summary for the overview tab.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    await requirePermission("events");
    const { eventId } = await ctx.params;
    return ok(await adminEventService.stats(eventId));
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
