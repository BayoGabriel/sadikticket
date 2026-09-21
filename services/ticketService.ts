import { Types } from 'mongoose';
import { connectDb } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { OrderModel } from '@/models/order';
import { TicketTypeModel } from '@/models/ticketType';
import { TicketModel } from '@/models/ticket';
import { nanoid } from 'nanoid';

function genTicketCode() {
  return nanoid(12).toUpperCase();
}

function genQrToken() {
  return nanoid(32);
}

export const ticketService = {
  async issueTicketsForOrder(orderId: string) {
    await connectDb();
    const session = await (await connectDb()).startSession();
    try {
      let createdCount = 0;
      await session.withTransaction(async () => {
        const order = await OrderModel.findById(orderId).session(session);
        if (!order) throw new ApiError('ORDER_NOT_FOUND', 'Order not found', 404);

        const existing = await TicketModel.find({ orderId: order._id }).session(session).countDocuments();
        if (existing > 0) return; // idempotent: already issued

        for (const item of order.items) {
          const type = await TicketTypeModel.findById(item.ticketTypeId).session(session);
          if (!type) throw new ApiError('TICKET_TYPE_NOT_FOUND', 'Ticket type missing', 400);

          // Inventory check
          const available = (type.quantity ?? 0) - (type.quantitySold ?? 0);
          if (available < item.quantity) throw new ApiError('TICKET_SOLD_OUT', 'Insufficient inventory', 400);

          // Reserve inventory
          type.quantitySold = (type.quantitySold ?? 0) + item.quantity;
          await type.save({ session });

          // Create tickets
          const tickets = Array.from({ length: item.quantity }, () => ({
            orderId: order._id,
            eventId: order.eventId,
            ticketTypeId: item.ticketTypeId,
            holderName: order.customerName,
            holderEmail: order.customerEmail,
            ticketCode: genTicketCode(),
            qrToken: genQrToken(),
            status: 'ISSUED' as const,
            issuedAt: new Date(),
          }));
          await TicketModel.insertMany(tickets, { session });
          createdCount += tickets.length;
        }
      });
      return { created: createdCount };
    } finally {
      await session.endSession();
    }
  },
};
