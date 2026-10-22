import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { OrderModel, type Order } from "@/models/order";
import { PaymentModel, type Payment } from "@/models/payment";
import { paymentService } from "@/services/paymentService";
import { TicketModel, type Ticket } from "@/models/ticket";
import { EventModel, type Event } from "@/models/event";

// GET /api/v1/orders/by-reference/:reference/status (public)
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await ctx.params;
    if (!reference) throw new Error("reference required");

    await connectDb();
    let order = await OrderModel.findOne({
      paymentReference: reference,
    }).lean<Order | null>();
    if (!order) return ok({ found: false });

    // Fallback for when the Paystack webhook hasn't landed (or isn't
    // configured): verify the transaction directly with Paystack.
    if (order.status === "PENDING") {
      try {
        const result = await paymentService.confirmPaystackPayment(reference);
        if (result.status === "PAID") {
          order =
            (await OrderModel.findOne({ paymentReference: reference }).lean<
              Order | null
            >()) ?? order;
        }
      } catch {
        // Verification failure (network, bad key) shouldn't break status reads
      }
    }

    const [event, payment, tickets] = await Promise.all([
      EventModel.findById(order.eventId).lean<Event | null>(),
      PaymentModel.findOne({
        providerReference: reference,
      }).lean<Payment | null>(),
      TicketModel.find({ orderId: order._id })
        .select("ticketCode ticketTypeId qrToken status")
        .lean<Ticket[]>(),
    ]);

    return ok({
      found: true,
      id: order._id.toString(),
      status: order.status,
      paymentStatus: payment?.status ?? "PENDING",
      paymentReference: order.paymentReference,
      event: event
        ? { id: event._id.toString(), name: event.name, slug: event.slug }
        : undefined,
      tickets: tickets?.map((t) => ({
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
