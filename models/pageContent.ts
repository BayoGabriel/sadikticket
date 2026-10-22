import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const PageVersionSchema = new Schema(
  {
    content: { type: String, required: true },
    savedBy: { type: String },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Editable public pages (refunds, terms, privacy, about body text).
// `content` is a small safe subset of HTML (h2/h3/p/ul/ol/li/strong/em/a/br).
const PageContentSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: ["refunds", "terms", "privacy", "about"],
    },
    content: { type: String, default: "" },
    versions: { type: [PageVersionSchema], default: [] }, // capped at 10
    lastUpdatedAt: { type: Date, default: Date.now },
    lastSavedBy: { type: String },
  },
  { timestamps: true }
);

export type PageContent = InferSchemaType<typeof PageContentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PageContentModel =
  models.PageContent || model("PageContent", PageContentSchema);
