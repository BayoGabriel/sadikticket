import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ["footer", "empty-state", "waitlist", "manual"],
      default: "footer",
      index: true,
    },
    city: { type: String },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    unsubscribedAt: { type: Date },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SubscriberSchema.index({ email: 1, source: 1 }, { unique: false });

export type Subscriber = InferSchemaType<typeof SubscriberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SubscriberModel =
  models.Subscriber || model("Subscriber", SubscriberSchema);
