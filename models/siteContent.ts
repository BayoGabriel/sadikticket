import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

// Admin-edited text/image overrides for hardcoded site copy. Each row is one
// registered field (see lib/site-copy.ts); the stored value replaces the
// default everywhere the key is read.
const SiteContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["text", "longtext", "image"], required: true },
    value: { type: String, required: true },
  },
  { timestamps: true },
);

export type SiteContent = InferSchemaType<typeof SiteContentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteContentModel =
  models.SiteContent || model("SiteContent", SiteContentSchema);
