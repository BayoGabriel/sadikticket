import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type EnquiryKind = 'private-booking' | 'business' | 'waitlist' | 'updates' | 'general';

export type EnquiryStage =
  | 'new'
  | 'contacted'
  | 'quote_sent'
  | 'confirmed'
  | 'done'
  | 'lost'
  | 'spam';

export const ENQUIRY_STAGES: { value: EnquiryStage; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quote_sent', label: 'Quote sent' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'done', label: 'Done' },
  { value: 'lost', label: 'Lost' },
  { value: 'spam', label: 'Spam' },
];

const EnquiryNoteSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: String, required: true }, // display name of team member
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

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
    // pipeline
    stage: {
      type: String,
      enum: ['new', 'contacted', 'quote_sent', 'confirmed', 'done', 'lost', 'spam'],
      default: 'new',
      index: true,
    },
    read: { type: Boolean, default: false, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerName: { type: String },
    notes: { type: [EnquiryNoteSchema], default: [] },
    followUpAt: { type: Date, index: true },
    quoteAmount: { type: Number }, // kobo
    booking: {
      date: { type: String },
      venue: { type: String },
      price: { type: Number }, // kobo
    },
    attachments: { type: [String], default: [] },
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EnquirySchema.index({ stage: 1, createdAt: -1 });
EnquirySchema.index({ kind: 1, stage: 1 });

export type Enquiry = InferSchemaType<typeof EnquirySchema> & { _id: mongoose.Types.ObjectId };

export const EnquiryModel = models.Enquiry || model('Enquiry', EnquirySchema);
