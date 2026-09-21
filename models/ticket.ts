import mongoose, { Schema, InferSchemaType, model, models } from "mongoose";

export type TicketStatus = "ISSUED" | "CHECKED_IN" | "VOID";

const TicketSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    ticketTypeId: {
      type: Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
      index: true,
    },
    holderName: { type: String, required: true },
    holderEmail: { type: String, required: true, index: true },
    ticketCode: { type: String, required: true, unique: true, index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["ISSUED", "CHECKED_IN", "VOID"],
      default: "ISSUED",
      index: true,
    },
    issuedAt: { type: Date, default: Date.now },
    checkedInAt: { type: Date },
    emailStatus: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
      index: true,
    },
    emailedAt: { type: Date },
  },
  { timestamps: true },
);

export type Ticket = InferSchemaType<typeof TicketSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TicketModel = models.Ticket || model("Ticket", TicketSchema);
