import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/response';
import { connectDb } from '@/lib/db';
import { OrderModel } from '@/models/order';
import { PaymentModel } from '@/models/payment';
import { TicketModel } from '@/models/ticket';
import { EventModel } from '@/models/event';

// GET /api/v1/orders/by-reference/:reference/status (public)
export async function GET(_req: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const { reference } = params;
    if (!reference) throw new Error('reference required');

    await connectDb();
    const order = await OrderModel.findOne({ paymentReference: reference }).lean();
    if (!order) return ok({ found: false });

    const [event, payment, tickets] = await Promise.all([
      EventModel.findById(order.eventId).lean(),
      PaymentModel.findOne({ providerReference: reference }).lean(),
      TicketModel.find({ orderId: order._id }).select('ticketCode ticketTypeId qrToken status').lean(),
    ]);

    return ok({
      found: true,
      id: order._id.toString(),
      status: order.status,
      paymentStatus: payment?.status ?? 'PENDING',
      paymentReference: order.paymentReference,
      event: event
        ? { id: event._id.toString(), name: event.name, slug: event.slug }
        : undefined,
      tickets: tickets?.map((t: any) => ({
        id: t._id.toString(),
        ticketCode: t.ticketCode,
        ticketTypeId: t.ticketTypeId.toString(),
        qrToken: t.qrToken,
        status: t.status,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
