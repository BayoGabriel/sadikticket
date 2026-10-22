import { connectDb } from "@/lib/db";
import { PaymentModel } from "@/models/payment";
import { OrderModel } from "@/models/order";
import { paystackService } from "@/services/paystackService";
import { ticketService } from "@/services/ticketService";
import { ticketEmailService } from "@/services/ticketEmailService";

export type PaymentConfirmation =
  | { status: "PAID"; orderId: string }
  | { status: "UNPAID" }
  | { status: "AMOUNT_MISMATCH" }
  | { status: "ORDER_NOT_FOUND" };

export const paymentService = {
  /**
   * Authoritatively confirm a Paystack transaction by reference.
   * Every step is idempotent — safe to call from the webhook and as a
   * fallback when polling order status.
   */
  async confirmPaystackPayment(
    reference: string,
  ): Promise<PaymentConfirmation> {
    await connectDb();

    const existing = await PaymentModel.findOne({
      providerReference: reference,
    });
    if (existing?.status === "SUCCESS") {
      return { status: "PAID", orderId: existing.orderId.toString() };
    }

    const verify = await paystackService.verify(reference);
    if (verify.status !== "success") return { status: "UNPAID" };

    const order = await OrderModel.findOne({ paymentReference: reference });
    if (!order) return { status: "ORDER_NOT_FOUND" };

    if (verify.amount !== order.total || verify.currency !== order.currency) {
      return { status: "AMOUNT_MISMATCH" };
    }

    await PaymentModel.findOneAndUpdate(
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

    if (order.status !== "PAID") {
      order.status = "PAID";
      await order.save();
      await ticketService.issueTicketsForOrder(order._id.toString());
    }

    await ticketEmailService.sendAllForOrder(order._id.toString());

    return { status: "PAID", orderId: order._id.toString() };
  },
};
