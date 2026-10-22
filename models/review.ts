import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "[First name]"
    context: { type: String }, // e.g. "Sip and Paint Night" or "Dangote, team day"
    kind: { type: String, enum: ["guest", "client"], default: "guest" },
    text: { type: String, required: true },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type Review = InferSchemaType<typeof ReviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReviewModel = models.Review || model("Review", ReviewSchema);
