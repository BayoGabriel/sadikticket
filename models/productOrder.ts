import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

// Shop orders — separate from event Orders (those carry tickets/seats).
const ProductOrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true }, // kobo
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const ProductOrderSchema = new Schema(
  {
    items: { type: [ProductOrderItemSchema], required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, index: true },
    customerPhone: { type: String },
    // Where the order goes — address or pickup note from the buyer.
    deliveryNote: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "PAYMENT_PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    fulfilledAt: { type: Date }, // set when the team hands the item over
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: "NGN" },
    paymentReference: { type: String, required: true, unique: true, index: true },
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
  },
  { timestamps: true },
);

export type ProductOrder = InferSchemaType<typeof ProductOrderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductOrderModel =
  models.ProductOrder || model("ProductOrder", ProductOrderSchema);
