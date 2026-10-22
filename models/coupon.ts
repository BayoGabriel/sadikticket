import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    kind: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 }, // percent 0-100 or kobo amount
    expiresAt: { type: Date },
    usageLimit: { type: Number, min: 0 }, // undefined = unlimited
    usageCount: { type: Number, default: 0, min: 0 },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" }, // unset = global
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type Coupon = InferSchemaType<typeof CouponSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CouponModel = models.Coupon || model("Coupon", CouponSchema);
