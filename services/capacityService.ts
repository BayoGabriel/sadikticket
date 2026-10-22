import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { TicketTypeModel } from "@/models/ticketType";
import { OrderModel, type Order } from "@/models/order";
import { Types } from "mongoose";

// Inventory is RESERVED at order creation (atomic $inc guarded by an $expr),
// then released when an order fails, expires, is cancelled or fully refunded.
// This means an abandoned checkout holds seats briefly — the stale-pending
// sweeper frees them after the expiry window.

export const STALE_PENDING_MINUTES = 45;

export const capacityService = {
  async reserve(items: { ticketTypeId: string; quantity: number }[]) {
    await connectDb();
    const reserved: { ticketTypeId: string; quantity: number }[] = [];
    try {
      for (const item of items) {
        const res = await TicketTypeModel.updateOne(
          {
            _id: new Types.ObjectId(item.ticketTypeId),
            status: "ACTIVE",
            $expr: {
              $lte: [
                { $add: [{ $ifNull: ["$quantitySold", 0] }, item.quantity] },
                "$quantity",
              ],
            },
          },
          { $inc: { quantitySold: item.quantity } },
        );
        if (res.modifiedCount === 0)
          throw new ApiError(
            "TICKET_SOLD_OUT",
            "Sorry — those tickets just sold out. Try fewer, or a different type.",
            400,
          );
        reserved.push(item);
      }
    } catch (e) {
      // Roll back whatever we reserved before failing.
      for (const r of reserved) {
        await TicketTypeModel.updateOne(
          { _id: r.ticketTypeId },
          [{ $set: { quantitySold: { $max: [0, { $subtract: ["$quantitySold", r.quantity] }] } } }],
        ).catch(() => {});
      }
      throw e;
    }
  },

  async release(items: { ticketTypeId: Types.ObjectId; quantity: number }[]) {
    await connectDb();
    for (const item of items) {
      await TicketTypeModel.updateOne(
        { _id: item.ticketTypeId },
        [{ $set: { quantitySold: { $max: [0, { $subtract: ["$quantitySold", item.quantity] }] } } }],
      ).catch(() => {});
    }
  },

  async releaseOrder(orderId: string | Types.ObjectId) {
    await connectDb();
    const order = await OrderModel.findById(orderId).lean<Order | null>();
    if (!order) return;
    await this.release(order.items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })));
  },

  // Free seats held by abandoned PENDING orders. Idempotent — safe to call
  // often (used by the orders list + cron).
  async releaseStalePending() {
    await connectDb();
    const cutoff = new Date(Date.now() - STALE_PENDING_MINUTES * 60_000);
    const stale = await OrderModel.find({
      status: { $in: ["PENDING", "PAYMENT_PROCESSING"] },
      manual: { $ne: true },
      createdAt: { $lt: cutoff },
    }).lean<Order[]>();
    for (const order of stale) {
      // Only expire if no successful payment raced in the meantime.
      const res = await OrderModel.updateOne(
        { _id: order._id, status: { $in: ["PENDING", "PAYMENT_PROCESSING"] } },
        { $set: { status: "EXPIRED" } },
      );
      if (res.modifiedCount)
        await this.release(order.items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })));
    }
    return stale.length;
  },
};
