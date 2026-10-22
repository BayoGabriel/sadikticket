import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type EnquiryKind = 'private-booking' | 'business' | 'waitlist' | 'updates' | 'general';

const EnquirySchema = new Schema(
  {
    kind: {
      type: String,
      enum: ['private-booking', 'business', 'waitlist', 'updates', 'general'],
      required: true,
      index: true,
    },
    name: { type: String },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    // private bookings
    occasion: { type: String },
    experience: { type: String },
    date: { type: String },
    guests: { type: String },
    location: { type: String },
    extra: { type: String },
    // business
    company: { type: String },
    service: { type: String },
    size: { type: String },
    frequency: { type: String },
    goals: { type: String },
    // general contact form
    message: { type: String },
    // waitlist / updates
    eventSlug: { type: String },
    eventName: { type: String },
    city: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type Enquiry = InferSchemaType<typeof EnquirySchema> & { _id: mongoose.Types.ObjectId };

export const EnquiryModel = models.Enquiry || model('Enquiry', EnquirySchema);
