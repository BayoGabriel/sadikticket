import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type TicketTypeStatus = 'ACTIVE' | 'INACTIVE';

const TicketTypeSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 }, // store in kobo/lowest unit
    currency: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    quantitySold: { type: Number, required: true, min: 0, default: 0 },
    salesStart: { type: Date },
    salesEnd: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
  },
  { timestamps: true }
);

TicketTypeSchema.index({ eventId: 1, status: 1 });

export type TicketType = InferSchemaType<typeof TicketTypeSchema> & { _id: mongoose.Types.ObjectId };

export const TicketTypeModel = models.TicketType || model('TicketType', TicketTypeSchema);
