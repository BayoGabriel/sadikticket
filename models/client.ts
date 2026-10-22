import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true },
    engagement: { type: String, default: "" }, // e.g. "Team bonding day"
    description: { type: String, default: "" },
    photo: { type: String, default: "" },
    logo: { type: String, default: "" },
    quote: { type: String, default: "" },
    approvalConfirmed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ClientSchema.index({ published: 1, order: 1 });

export type Client = InferSchemaType<typeof ClientSchema> & { _id: mongoose.Types.ObjectId };

export const ClientModel = models.Client || model("Client", ClientSchema);
