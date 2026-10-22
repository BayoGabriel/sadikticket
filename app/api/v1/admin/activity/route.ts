import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { auditService } from "@/services/auditService";

// GET /api/v1/admin/activity?q=&action=&entityType=&page=
export async function GET(req: NextRequest) {
  try {
    await requirePermission("audit");
    const sp = req.nextUrl.searchParams;
    const result = await auditService.list({
      q: sp.get("q") || undefined,
      action: sp.get("action") || undefined,
      entityType: sp.get("entityType") || undefined,
      page: Number(sp.get("page") || 1),
      limit: 30,
    });
    return ok({
      items: result.items.map((a) => ({
        id: String(a._id),
        actorName: a.actorName ?? a.actorEmail ?? "System",
        action: a.action,
        entityType: a.entityType ?? "",
        entityLabel: a.entityLabel ?? "",
        detail: a.detail ?? {},
        createdAt: a.createdAt,
      })),
      page: result.page,
      pages: result.pages,
      total: result.total,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
