import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/response';
import { OrderModel } from '@/models/order';
import { paystackService } from '@/services/paystackService';
import { connectDb } from '@/lib/db';

// POST /api/v1/payments/paystack/initialize
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error('orderId required');

    await connectDb();
    const order = await OrderModel.findById(orderId).lean();
    if (!order) throw new Error('Order not found');
    if (order.status !== 'PENDING') throw new Error('Order not pending');

    const init = await paystackService.initializePayment({
      email: order.customerEmail,
      amountKobo: order.total,
      reference: order.paymentReference,
      currency: order.currency,
      metadata: { orderId: order._id.toString() },
      callback_url: `${process.env.APP_URL}/payment/callback`,
    });

    return ok({ authorizationUrl: init.authorization_url, reference: init.reference });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
