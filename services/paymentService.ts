import { connectDb } from "@/lib/db";
import { PaymentModel } from "@/models/payment";
import { OrderModel } from "@/models/order";
import { getPaymentProvider } from "@/services/payments";
import { ticketService } from "@/services/ticketService";
import { ticketEmailService } from "@/services/ticketEmailService";
import { couponService } from "@/services/couponService";
import { capacityService } from "@/services/capacityService";

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

    const verify = await getPaymentProvider().verify(reference);
    if (verify.status !== "success") {
      // Paystack gave a definitive non-success → close the order and free
      // the seats it was holding. ("pending"/"ongoing" stay pending; the
      // stale-order sweeper expires them later.)
      if (["failed", "abandoned", "reversed", "cancelled"].includes(verify.status)) {
        const res = await OrderModel.updateOne(
          { paymentReference: reference, status: { $in: ["PENDING", "PAYMENT_PROCESSING"] } },
          { $set: { status: "FAILED" } },
        );
        if (res.modifiedCount) {
          const o = (await OrderModel.findOne({ paymentReference: reference }).lean()) as { _id: { toString(): string } } | null;
          if (o) await capacityService.releaseOrder(String(o._id));
        }
      }
      return { status: "UNPAID" };
    }

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
      // If a previously failed/expired/cancelled order comes back as paid,
      // its seats were released — re-reserve them first.
      const releasedStates = ["FAILED", "EXPIRED", "CANCELLED", "REFUNDED"];
      if (releasedStates.includes(order.status)) {
        try {
          await capacityService.reserve(
            order.items.map((i: { ticketTypeId: { toString(): string }; quantity: number }) => ({ ticketTypeId: String(i.ticketTypeId), quantity: i.quantity })),
          );
        } catch {
          // The seats sold to someone else — the buyer still paid, so we
          // honour the order and flag it for the team to sort out.
          order.notes = order.notes ?? [];
          order.notes.push({
            text: "Payment confirmed after seats were released — order is over capacity. Please contact the guest.",
            author: "system",
            createdAt: new Date(),
          });
        }
      }
      order.status = "PAID";
      await order.save();
      await ticketService.issueTicketsForOrder(order._id.toString());
      if (order.couponCode) {
        await couponService.redeem(order.couponCode, order.discountAmount ?? 0).catch(() => {});
      }
    }

    await ticketEmailService.sendAllForOrder(order._id.toString());

    return { status: "PAID", orderId: order._id.toString() };
  },
};
