import { connectDb } from "@/lib/db";
import { CouponModel, type Coupon } from "@/models/coupon";
import { Types } from "mongoose";

export type CouponCheck =
  | { valid: true; discount: number; code: string; label: string }
  | { valid: false; reason: string };

export const couponService = {
  // Validate a code against an event + subtotal (kobo). Returns the discount
  // in kobo when valid.
  async validate(
    code: string,
    eventId: string,
    subtotal: number,
  ): Promise<CouponCheck> {
    await connectDb();
    const coupon = await CouponModel.findOne({
      code: code.trim().toUpperCase(),
      active: true,
    }).lean<Coupon | null>();

    if (!coupon) return { valid: false, reason: "That code doesn't look right." };
    if (coupon.expiresAt && new Date() > coupon.expiresAt)
      return { valid: false, reason: "That code has expired." };
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
      return { valid: false, reason: "That code has been fully used." };
    if (coupon.eventId && String(coupon.eventId) !== String(eventId))
      return { valid: false, reason: "That code isn't valid for this event." };

    const discount =
      coupon.kind === "percent"
        ? Math.floor((subtotal * Math.min(coupon.value, 100)) / 100)
        : Math.min(coupon.value, subtotal);

    const label =
      coupon.kind === "percent"
        ? `${coupon.value}% off`
        : `₦${(coupon.value / 100).toLocaleString("en-NG")} off`;

    return { valid: true, discount, code: coupon.code, label };
  },

  // Record a redemption — called once payment is confirmed.
  async redeem(code: string) {
    await connectDb();
    await CouponModel.updateOne(
      { code: code.trim().toUpperCase() },
      { $inc: { usageCount: 1 } },
    );
  },

  async list() {
    await connectDb();
    return CouponModel.find().sort({ createdAt: -1 }).lean<Coupon[]>();
  },

  async create(input: {
    code: string;
    kind: "percent" | "fixed";
    value: number;
    expiresAt?: Date;
    usageLimit?: number;
    eventId?: string;
    active?: boolean;
  }) {
    await connectDb();
    return CouponModel.create({
      ...input,
      code: input.code.trim().toUpperCase(),
      eventId: input.eventId ? new Types.ObjectId(input.eventId) : undefined,
    });
  },

  async update(
    id: string,
    patch: { active?: boolean; expiresAt?: Date | null; usageLimit?: number | null },
  ) {
    await connectDb();
    return CouponModel.findByIdAndUpdate(id, patch, { new: true }).lean<Coupon | null>();
  },
};
