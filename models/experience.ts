import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const ExperienceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["creative", "social", "outdoor"],
      required: true,
      index: true,
    },
    oneLiner: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    whatItIs: { type: String, default: "" },
    whatToExpect: { type: [String], default: [] },
    whoItSuits: { type: [String], default: [] },
    addOns: { type: [String], default: [] },
    eventType: { type: String, default: "" }, // matches Event.eventType so public pages list related events
    eventTags: { type: [String], default: [] }, // matched against event tags for "events of this type"
    wide: { type: Boolean, default: false }, // spans full row on /experiences
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExperienceSchema.index({ published: 1, category: 1, order: 1 });

export type Experience = InferSchemaType<typeof ExperienceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ExperienceModel =
  models.Experience || model("Experience", ExperienceSchema);
