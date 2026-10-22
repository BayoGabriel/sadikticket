import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

export type WaitlistStatus = "waiting" | "notified" | "converted" | "removed";

const WaitlistEntrySchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    status: {
      type: String,
      enum: ["waiting", "notified", "converted", "removed"],
      default: "waiting",
      index: true,
    },
    notifiedAt: { type: Date },
    convertedAt: { type: Date },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WaitlistEntrySchema.index({ eventId: 1, status: 1, createdAt: 1 });

export type WaitlistEntry = InferSchemaType<typeof WaitlistEntrySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WaitlistEntryModel =
  models.WaitlistEntry || model("WaitlistEntry", WaitlistEntrySchema);
