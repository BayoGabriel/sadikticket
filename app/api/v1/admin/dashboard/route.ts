import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { dashboardService, parseRange } from "@/services/dashboardService";

// GET /api/v1/admin/dashboard?range=7d|30d|today|custom&from&to
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const sp = req.nextUrl.searchParams;
    const range = parseRange({
      range: sp.get("range") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
    });
    const data = await dashboardService.get(range, user.name);
    return ok(data);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
