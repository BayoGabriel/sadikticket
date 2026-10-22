import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { couponCreateSchema } from "@/schemas/coupon";
import { couponService } from "@/services/couponService";

// GET /api/v1/admin/coupons?format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("coupons");
    const items = await couponService.list();
    const rows = items.map((c) => ({
      id: String(c._id),
      code: c.code,
      kind: c.kind,
      value: c.kind === "percent" ? `${c.value}%` : c.value / 100,
      expiresAt: c.expiresAt?.toISOString?.() ?? "",
      usage: `${c.usageCount}${c.usageLimit != null ? `/${c.usageLimit}` : ""}`,
      eventId: c.eventId ? String(c.eventId) : "global",
      active: c.active,
    }));
    if (new URL(req.url).searchParams.get("format") === "csv") {
      return csvResponse(
        toCsv(rows, [
          { key: "code", label: "Code" },
          { key: "value", label: "Value" },
          { key: "expiresAt", label: "Expires" },
          { key: "usage", label: "Usage" },
          { key: "eventId", label: "Event" },
          { key: "active", label: "Active" },
        ]),
        "coupons.csv",
      );
    }
    return ok({ items: rows });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST /api/v1/admin/coupons
export async function POST(req: NextRequest) {
  try {
    await requirePermission("coupons");
    const input = couponCreateSchema.parse(await req.json());
    const doc = await couponService.create(input);
    return ok({ id: String(doc._id), code: doc.code }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
