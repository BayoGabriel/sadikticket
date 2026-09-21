import { connectDb } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { OrderModel } from '@/models/order';
import { EventModel } from '@/models/event';
import { TicketTypeModel } from '@/models/ticketType';
import { nanoid } from 'nanoid';
import { Types } from 'mongoose';

export const orderService = {
  async create(input: {
    eventId: string;
    items: { ticketTypeId: string; quantity: number }[];
    customer: { name: string; email: string; phone?: string };
  }) {
    await connectDb();

    const event = await EventModel.findById(input.eventId).lean();
    if (!event) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);
    if (event.status !== 'PUBLISHED') throw new ApiError('EVENT_NOT_PUBLISHED', 'Event is not published', 400);

    const typeIds = input.items.map((i) => new Types.ObjectId(i.ticketTypeId));
    const types = await TicketTypeModel.find({ _id: { $in: typeIds }, eventId: event._id }).lean();
    if (types.length !== typeIds.length) throw new ApiError('TICKET_TYPE_NOT_FOUND', 'Invalid ticket type(s)', 400);

    let subtotal = 0;
    const orderItems = input.items.map((it) => {
      const type = types.find((t) => t._id.toString() === it.ticketTypeId)!;
      // Validate availability and sales window
      const now = new Date();
      if (type.status !== 'ACTIVE') throw new ApiError('TICKET_SOLD_OUT', 'Ticket inactive', 400);
      if (type.salesStart && now < type.salesStart) throw new ApiError('EVENT_SALES_CLOSED', 'Sales not started', 400);
      if (type.salesEnd && now > type.salesEnd) throw new ApiError('EVENT_SALES_CLOSED', 'Sales ended', 400);
      if ((type.quantitySold ?? 0) + it.quantity > (type.quantity ?? 0))
        throw new ApiError('TICKET_SOLD_OUT', 'Not enough inventory', 400);

      subtotal += type.price * it.quantity;
      return {
        ticketTypeId: type._id,
        name: type.name,
        unitPrice: type.price,
        quantity: it.quantity,
        currency: type.currency,
      };
    });

    const fees = 0; // placeholder for future fee model
    const total = subtotal + fees;

    const paymentReference = `EVT-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;

    const order = await OrderModel.create({
      eventId: event._id,
      items: orderItems,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      status: 'PENDING',
      subtotal,
      fees,
      total,
      currency: orderItems[0].currency,
      paymentReference,
    });

    return order.toObject();
  },
};
