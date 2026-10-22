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
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    checkoutAnswer: { type: String }, // "What's your preferred experience?"
    reminderSentAt: { type: Date },
    // 'paystack' for online sales; cash/transfer/pos/complimentary for manual sales
    paymentMethod: {
      type: String,
      enum: ['paystack', 'cash', 'transfer', 'pos', 'complimentary'],
      default: 'paystack',
      index: true,
    },
    manual: { type: Boolean, default: false, index: true }, // sold by a team member
    soldBy: { type: String }, // team member name for manual sales
    refundedAmount: { type: Number, default: 0 }, // kobo
    refundedAt: { type: Date },
    refundReason: { type: String },
    notes: {
      type: [
        {
          text: { type: String, required: true },
          author: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
    transferredTo: { type: String }, // free-text note if order was transferred
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
