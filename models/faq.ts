import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General", index: true },
    // topic tags used to auto-pick the 3 most relevant FAQs per event page
    topics: { type: [String], default: [] },
    showOnEventPages: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
    // True while the answer still contains a "[Your ...]" placeholder.
    needsAnswer: { type: Boolean, default: false },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FaqSchema.index({ published: 1, order: 1 });

export type Faq = InferSchemaType<typeof FaqSchema> & { _id: mongoose.Types.ObjectId };

export const FaqModel = models.Faq || model("Faq", FaqSchema);
