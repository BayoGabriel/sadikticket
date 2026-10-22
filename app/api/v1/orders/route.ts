import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/response';
import { orderCreateSchema } from '@/schemas/order';
import { orderService } from '@/services/orderService';
import type { Order } from '@/models/order';

// POST /api/v1/orders (public) - creates pending order with calculated totals
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = orderCreateSchema.parse(json);
    const order = await orderService.create(input);
    return ok({
      id: order._id.toString(),
      eventId: order.eventId.toString(),
      customer: { name: order.customerName, email: order.customerEmail },
      items: order.items.map((i: Order["items"][number]) => ({
        ticketTypeId: i.ticketTypeId.toString(),
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal: order.subtotal,
      discountAmount: order.discountAmount ?? 0,
      fees: order.fees,
      total: order.total,
      currency: order.currency,
      paymentReference: order.paymentReference,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
