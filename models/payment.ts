import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    provider: { type: String, required: true },
    providerReference: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING', index: true },
    providerResponse: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export type Payment = InferSchemaType<typeof PaymentSchema> & { _id: mongoose.Types.ObjectId };

export const PaymentModel = models.Payment || model('Payment', PaymentSchema);
