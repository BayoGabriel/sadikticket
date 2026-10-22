import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { couponService } from "@/services/couponService";
import { auditService } from "@/services/auditService";
import { connectDb } from "@/lib/db";
import { CouponModel } from "@/models/coupon";

const patchSchema = z.object({
  kind: z.enum(["percent", "fixed"]).optional(),
  value: z.number().positive().optional(),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  perCustomerLimit: z.number().int().positive().nullable().optional(),
  minOrderNaira: z.number().positive().nullable().optional(),
  eventIds: z.array(z.string()).optional(),
  ticketTypeIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

// PATCH /api/v1/admin/coupons/:id
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("coupons");
    const { id } = await ctx.params;
    const input = patchSchema.parse(await req.json());
    const doc = await couponService.update(id, {
      ...input,
      value: input.value !== undefined ? (input.kind === "percent" ? Math.min(input.value, 100) : Math.round(input.value * 100)) : undefined,
      startsAt: input.startsAt === undefined ? undefined : input.startsAt ? new Date(input.startsAt) : null,
      expiresAt: input.expiresAt === undefined ? undefined : input.expiresAt ? new Date(input.expiresAt) : null,
      minOrderAmount: input.minOrderNaira === undefined ? undefined : input.minOrderNaira ? Math.round(input.minOrderNaira * 100) : null,
    });
    if (!doc) throw new Error("Coupon not found");
    await auditService.record({
      actor: user,
      action: "coupon.updated",
      entityType: "coupon",
      entityId: id,
      entityLabel: doc.code,
    });
    return ok({ id });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// GET /api/v1/admin/coupons/:id/orders lives on ?detail — here GET returns
// usage + orders that used the code.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requirePermission("coupons");
    const { id } = await ctx.params;
    await connectDb();
    const coupon = await CouponModel.findById(id).lean<{ code: string } | null>();
    if (!coupon) throw new Error("Coupon not found");
    const orders = await couponService.ordersUsing(coupon.code);
    return ok({
      orders: orders.map((o) => ({
        id: String(o._id),
        reference: o.paymentReference,
        customer: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST — duplicate (fresh code, same rules, zero usage).
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("coupons");
    const { id } = await ctx.params;
    const copy = await couponService.duplicate(id);
    if (!copy) throw new Error("Coupon not found");
    await auditService.record({
      actor: user,
      action: "coupon.duplicated",
      entityType: "coupon",
      entityId: String(copy._id),
      entityLabel: copy.code,
    });
    return ok({ id: String(copy._id), code: copy.code });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// DELETE — blocked if the coupon has been used (deactivate instead).
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("coupons");
    const { id } = await ctx.params;
    const removed = await couponService.remove(id);
    if (!removed) {
      // Used → deactivate instead of deleting history.
      const doc = await couponService.update(id, { active: false });
      if (!doc) throw new Error("Coupon not found");
      return ok({ deactivated: true });
    }
    await auditService.record({ actor: user, action: "coupon.deleted", entityType: "coupon", entityId: id });
    return ok({ deleted: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
