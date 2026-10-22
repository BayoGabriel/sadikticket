import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    name: { type: String, required: true }, // guest first name
    context: { type: String }, // e.g. "Sip and Paint Night" or "Dangote, team day"
    kind: { type: String, enum: ["guest", "client"], default: "guest", index: true },
    text: { type: String, required: true }, // verbatim, never edited
    shortText: { type: String }, // optional flagged "short version"
    photo: { type: String }, // screenshot / photo URL
    source: {
      type: String,
      enum: ["written", "whatsapp", "instagram", "verbal", "other"],
      default: "written",
    },
    // must be true before the review can be published
    permissionConfirmed: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }, // homepage (max 3 shown)
    order: { type: Number, default: 0 },
    approved: { type: Boolean, default: false, index: true },
    // client reviews only
    company: { type: String },
    role: { type: String },
    logo: { type: String },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Review = InferSchemaType<typeof ReviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReviewModel = models.Review || model("Review", ReviewSchema);
