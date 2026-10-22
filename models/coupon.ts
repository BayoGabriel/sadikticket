import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    kind: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 }, // percent 0-100 or kobo amount
    startsAt: { type: Date }, // optional start window
    expiresAt: { type: Date },
    usageLimit: { type: Number, min: 0 }, // undefined = unlimited
    perCustomerLimit: { type: Number, min: 1 }, // per customer email
    usageCount: { type: Number, default: 0, min: 0 },
    // scope: null eventId = all events; eventIds restricts to specific events;
    // ticketTypeIds further restricts to specific ticket types
    eventId: { type: Schema.Types.ObjectId, ref: "Event" }, // legacy single-event scope
    eventIds: { type: [Schema.Types.ObjectId], ref: "Event", default: [] },
    ticketTypeIds: { type: [Schema.Types.ObjectId], ref: "TicketType", default: [] },
    minOrderAmount: { type: Number, min: 0 }, // kobo
    active: { type: Boolean, default: true, index: true },
    discountedTotal: { type: Number, default: 0 }, // kobo given away, for stats
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Coupon = InferSchemaType<typeof CouponSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CouponModel = models.Coupon || model("Coupon", CouponSchema);
