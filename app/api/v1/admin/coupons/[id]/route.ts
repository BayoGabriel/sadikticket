import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { couponUpdateSchema } from "@/schemas/coupon";
import { couponService } from "@/services/couponService";

// PATCH /api/v1/admin/coupons/[id] — activate/deactivate, edit limits
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission("coupons");
    const { id } = await ctx.params;
    const input = couponUpdateSchema.parse(await req.json());
    const doc = await couponService.update(id, input);
    if (!doc) throw new Error("Coupon not found");
    return ok({ id, active: doc.active });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
