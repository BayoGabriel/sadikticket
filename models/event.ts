import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

const EventSchema = new Schema(
  {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    coverImage: { type: String },
    venueName: { type: String },
    venueAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    timezone: { type: String, required: true },
    capacity: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'], default: 'DRAFT', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export type Event = InferSchemaType<typeof EventSchema> & { _id: mongoose.Types.ObjectId };

export const EventModel = models.Event || model('Event', EventSchema);
