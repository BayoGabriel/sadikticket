import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';

const CheckoutQuestionSchema = new Schema(
  {
    text: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] }, // empty = free text
  },
  { _id: false }
);

const EventSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String }, // one-line hook, ≤100 chars
    description: { type: String },
    coverImage: { type: String },
    coverImageAlt: { type: String, default: '' },
    includes: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    eventType: { type: String }, // painting, karaoke, picnic, pottery…
    directions: { type: String }, // how to get there / parking / landmark
    mapLink: { type: String },
    mapImage: { type: String },
    gallery: { type: [String], default: [] },
    faqIds: { type: [String], default: [] },
    statusOverride: {
      type: String,
      enum: ["on-sale", "few-left", "sold-out", "coming-soon", null],
      default: null,
    },
    venueName: { type: String },
    venueAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    doorsOpenAt: { type: Date },
    timezone: { type: String, required: true },
    capacity: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    publishedAt: { type: Date },
    scheduledPublishAt: { type: Date },
    archivedAt: { type: Date },
    // per-event override of the site-wide "few tickets left" threshold
    fewLeftThreshold: { type: Number, min: 0 },
    checkoutQuestion: { type: CheckoutQuestionSchema, default: undefined },
    goodToKnow: {
      ageLimit: { type: String, default: '' },
      whatToWear: { type: String, default: '' },
      runningLate: { type: String, default: '' },
    },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, startsAt: 1 });
EventSchema.index({ city: 1, startsAt: 1 });

export type Event = InferSchemaType<typeof EventSchema> & { _id: mongoose.Types.ObjectId };

export const EventModel = models.Event || model('Event', EventSchema);
