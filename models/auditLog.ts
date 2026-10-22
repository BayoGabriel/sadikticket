import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorEmail: { type: String, index: true },
    actorName: { type: String },
    action: { type: String, required: true, index: true }, // e.g. "event.published", "order.refunded"
    entityType: { type: String, index: true }, // event | order | coupon | enquiry | setting | ...
    entityId: { type: String, index: true },
    entityLabel: { type: String }, // human-friendly name for the activity feed
    detail: { type: Schema.Types.Mixed }, // small diff/context object
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export type AuditLog = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };

export const AuditLogModel = models.AuditLog || model("AuditLog", AuditLogSchema);
