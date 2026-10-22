import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

export const MEDIA_TAGS = [
  "painting",
  "karaoke",
  "picnic",
  "pottery",
  "private party",
  "team day",
] as const;

const MediaAssetSchema = new Schema(
  {
    kind: { type: String, enum: ["photo", "video"], required: true, index: true },
    url: { type: String, required: true },
    poster: { type: String, default: "" }, // video poster frame
    publicId: { type: String, default: "" }, // storage provider id for deletes
    alt: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    duration: { type: Number }, // seconds, videos only
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true }, // homepage strip
    published: { type: Boolean, default: true, index: true },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MediaAssetSchema.index({ published: 1, order: 1 });

export type MediaAsset = InferSchemaType<typeof MediaAssetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const MediaAssetModel =
  models.MediaAsset || model("MediaAsset", MediaAssetSchema);
