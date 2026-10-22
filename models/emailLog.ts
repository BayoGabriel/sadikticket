import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const EmailLogSchema = new Schema(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    template: { type: String, index: true }, // template key
    status: {
      type: String,
      enum: ["SENT", "FAILED", "QUEUED"],
      default: "SENT",
      index: true,
    },
    error: { type: String },
    // Rendered body kept so "Resend" replays the exact message.
    body: { type: String },
    meta: { type: Schema.Types.Mixed }, // orderId, eventId, enquiryId, etc.
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

EmailLogSchema.index({ createdAt: -1 });

export type EmailLog = InferSchemaType<typeof EmailLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const EmailLogModel = models.EmailLog || model("EmailLog", EmailLogSchema);
