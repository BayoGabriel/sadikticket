import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { eventService } from "@/services/eventService";

// POST /api/v1/admin/events/:eventId/publish
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    const updated = await eventService.update(eventId, { status: "PUBLISHED" });
    return ok({
      id: updated._id.toString(),
      status: updated.status,
      publishedAt: updated.publishedAt,
    });
  } catch (e: any) {
    return fail(e);
  }
}
