import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { paystackService } from "@/services/paystackService";
import { PaymentModel } from "@/models/payment";
import { OrderModel } from "@/models/order";
import { ticketService } from "@/services/ticketService";
import { connectDb } from "@/lib/db";
import { ticketEmailService } from "@/services/ticketEmailService";

// POST /api/v1/webhooks/paystack
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    if (!paystackService.isValidSignature(raw, signature)) {
      return new Response("Invalid signature", { status: 400 });
    }

    const evt = JSON.parse(raw);
    if (evt.event !== "charge.success") return ok({ received: true });

    const data = evt.data;
    const reference = data.reference as string;

    await connectDb();

    // Idempotent check: payment by provider reference
    let payment = await PaymentModel.findOne({ providerReference: reference });
    if (payment && payment.status === "SUCCESS") return ok({ processed: true });

    // Verify with Paystack (defense-in-depth)
    const verify = await paystackService.verify(reference);
    if (verify.status !== "success") return ok({ processed: false });

    const order = await OrderModel.findOne({ paymentReference: reference });
    if (!order) return ok({ processed: false });

    if (verify.amount !== order.total || verify.currency !== order.currency) {
      return ok({ processed: false });
    }

    // Upsert payment record
    payment = await PaymentModel.findOneAndUpdate(
      { providerReference: reference },
      {
        orderId: order._id,
        provider: "PAYSTACK",
        providerReference: reference,
        amount: order.total,
        currency: order.currency,
        status: "SUCCESS",
        providerResponse: verify,
        paidAt: new Date(verify.paid_at ?? Date.now()),
      },
      { upsert: true, new: true },
    );

    // Update order state if not yet paid, then issue tickets atomically
    if (order.status !== "PAID") {
      order.status = "PAID";
      await order.save();
      await ticketService.issueTicketsForOrder(order._id.toString());
    }

    // Attempt to send ticket emails for this order (idempotent per ticket via emailStatus)
    await ticketEmailService.sendAllForOrder(order._id.toString());

    return ok({ processed: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
