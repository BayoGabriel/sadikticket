import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { eventService } from "@/services/eventService";
import { adminEventService } from "@/services/adminEventService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1).max(200),
  action: z.enum(["publish", "unpublish", "archive"]),
});

// POST /api/v1/admin/events/bulk
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("events");
    const { ids, action } = bulkSchema.parse(await req.json());
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const id of ids) {
      try {
        if (action === "publish") await eventService.update(id, { status: "PUBLISHED" });
        else if (action === "unpublish") await eventService.update(id, { status: "DRAFT" });
        else await adminEventService.archive(id);
        results.push({ id, ok: true });
      } catch (e) {
        results.push({ id, ok: false, error: (e as Error).message });
      }
    }

    await auditService.record({
      actor: user,
      action: `event.bulk-${action}`,
      entityType: "event",
      detail: { ids, failed: results.filter((r) => !r.ok).length },
    });
    revalidatePublicSite();
    return ok({ results, done: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
