import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

const CheckInSchema = new Schema(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    staffUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    method: { type: String, default: 'QR_SCAN' },
  },
  { timestamps: true }
);

export type CheckIn = InferSchemaType<typeof CheckInSchema> & { _id: mongoose.Types.ObjectId };

export const CheckInModel = models.CheckIn || model('CheckIn', CheckInSchema);
