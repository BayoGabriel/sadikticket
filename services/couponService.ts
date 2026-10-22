import { connectDb } from "@/lib/db";
import { CouponModel, type Coupon } from "@/models/coupon";
import { OrderModel } from "@/models/order";
import { evaluateCouponRules } from "@/lib/couponRules";
import { Types } from "mongoose";

export type CouponCheck =
  | { valid: true; discount: number; code: string; label: string }
  | { valid: false; reason: string };

export const couponService = {
  // Validate a code against an event + order. `subtotal` is the kobo total,
  // `ctx` carries the extra rule inputs (items, buyer email).
  async validate(
    code: string,
    eventId: string,
    subtotal: number,
    ctx?: { ticketTypeIds?: string[]; customerEmail?: string },
  ): Promise<CouponCheck> {
    await connectDb();
    const coupon = await CouponModel.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    }).lean<Coupon | null>();

    // Per-customer limit needs an order count — resolved here, judged by
    // the pure rule evaluator below.
    let priorUses = 0;
    if (coupon?.perCustomerLimit && ctx?.customerEmail) {
      priorUses = await OrderModel.countDocuments({
        customerEmail: ctx.customerEmail,
        couponCode: coupon.code,
        status: { $in: ["PAID", "PENDING", "PAYMENT_PROCESSING"] },
      });
    }

    return evaluateCouponRules(coupon, {
      eventId,
      subtotal,
      ticketTypeIds: ctx?.ticketTypeIds,
      customerPriorUses: priorUses,
    });
  },

  // Record a redemption — called once payment is confirmed.
  async redeem(code: string, discounted = 0) {
    await connectDb();
    await CouponModel.updateOne(
      { code: code.trim().toUpperCase() },
      { $inc: { usageCount: 1, discountedTotal: discounted } },
    );
  },

  async usage(code: string) {
    await connectDb();
    const c = await CouponModel.findOne({ code: code.trim().toUpperCase() }).lean<Coupon | null>();
    return { timesUsed: c?.usageCount ?? 0, discountedTotal: c?.discountedTotal ?? 0 };
  },

  async ordersUsing(code: string, limit = 50) {
    await connectDb();
    return OrderModel.find({ couponCode: code.trim().toUpperCase() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async list() {
    await connectDb();
    return CouponModel.find().sort({ createdAt: -1 }).lean<Coupon[]>();
  },

  async create(input: {
    code: string;
    kind: "percent" | "fixed";
    value: number;
    startsAt?: Date;
    expiresAt?: Date;
    usageLimit?: number;
    perCustomerLimit?: number;
    eventId?: string;
    eventIds?: string[];
    ticketTypeIds?: string[];
    minOrderAmount?: number;
    active?: boolean;
  }) {
    await connectDb();
    return CouponModel.create({
      ...input,
      code: input.code.trim().toUpperCase(),
      eventId: input.eventId ? new Types.ObjectId(input.eventId) : undefined,
      eventIds: (input.eventIds ?? []).map((id) => new Types.ObjectId(id)),
      ticketTypeIds: (input.ticketTypeIds ?? []).map((id) => new Types.ObjectId(id)),
    });
  },

  async duplicate(id: string) {
    await connectDb();
    const c = await CouponModel.findById(id).lean<Coupon | null>();
    if (!c) return null;
    const { _id, createdAt, updatedAt, usageCount, discountedTotal, ...rest } = c;
    void _id; void createdAt; void updatedAt; void usageCount; void discountedTotal;
    let code = `${c.code}-COPY`;
    let n = 1;
    while (await CouponModel.exists({ code })) code = `${c.code}-COPY${n++}`;
    return CouponModel.create({ ...rest, code });
  },

  async update(
    id: string,
    patch: Partial<{
      kind: "percent" | "fixed";
      value: number;
      startsAt: Date | null;
      expiresAt: Date | null;
      usageLimit: number | null;
      perCustomerLimit: number | null;
      eventIds: string[];
      ticketTypeIds: string[];
      minOrderAmount: number | null;
      active: boolean;
    }>,
  ) {
    await connectDb();
    const $set: Record<string, unknown> = { ...patch };
    if (patch.eventIds) $set.eventIds = patch.eventIds.map((e) => new Types.ObjectId(e));
    if (patch.ticketTypeIds) $set.ticketTypeIds = patch.ticketTypeIds.map((t) => new Types.ObjectId(t));
    return CouponModel.findByIdAndUpdate(id, { $set }, { new: true }).lean<Coupon | null>();
  },

  async remove(id: string) {
    await connectDb();
    const c = await CouponModel.findById(id).lean<Coupon | null>();
    if (!c) return false;
    if ((c.usageCount ?? 0) > 0) return false; // caller deactivates instead
    await CouponModel.deleteOne({ _id: id });
    return true;
  },
};
