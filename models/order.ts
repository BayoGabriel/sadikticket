import mongoose, { Schema, InferSchemaType, model, models } from 'mongoose';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

const OrderItemSchema = new Schema(
  {
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'PAYMENT_PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    subtotal: { type: Number, required: true },
    fees: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true },
    paymentReference: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };

export const OrderModel = models.Order || model('Order', OrderSchema);
