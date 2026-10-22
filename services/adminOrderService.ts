import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { OrderModel, type Order } from "@/models/order";
import { TicketModel, type Ticket } from "@/models/ticket";
import { TicketTypeModel, type TicketType as TicketTypeDoc } from "@/models/ticketType";
import { EventModel, type Event } from "@/models/event";
import { PaymentModel } from "@/models/payment";
import { Types, type HydratedDocument } from "mongoose";
import { nanoid } from "nanoid";
import { capacityService } from "@/services/capacityService";
import { ticketService } from "@/services/ticketService";
import { ticketEmailService } from "@/services/ticketEmailService";
import { paymentService } from "@/services/paymentService";
import { paystackService } from "@/services/paystackService";
import { emailTemplateService } from "@/services/emailTemplateService";
import { couponService } from "@/services/couponService";
import { waitlistService } from "@/services/waitlistService";
import type { AuthUser } from "@/lib/auth";

type OrderDoc = HydratedDocument<Order>;

function assertFound<T>(v: T, what = "Order"): NonNullable<T> {
  if (!v) throw new ApiError("ORDER_NOT_FOUND", `${what} not found`, 404);
  return v as NonNullable<T>;
}

export const adminOrderService = {
  async list(params: {
    event?: string;
    status?: string;
    q?: string;
    from?: string;
    to?: string;
    ticketType?: string;
    page: number;
    limit: number;
  }) {
    await connectDb();
    await capacityService.releaseStalePending().catch(() => 0);

    const filter: Record<string, unknown> = {};
    if (params.event) filter.eventId = new Types.ObjectId(params.event);
    if (params.status) filter.status = params.status;
    if (params.ticketType) filter["items.name"] = params.ticketType;
    if (params.from || params.to) {
      filter.createdAt = {
        ...(params.from ? { $gte: new Date(params.from) } : {}),
        ...(params.to ? { $lte: new Date(`${params.to}T23:59:59`) } : {}),
      };
    }
    if (params.q) {
      const rx = { $regex: params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      // Ticket codes resolve to their orders too.
      const ticketOrders = await TicketModel.find({ ticketCode: rx })
        .distinct("orderId");
      filter.$or = [
        { customerName: rx },
        { customerEmail: rx },
        { customerPhone: rx },
        { paymentReference: rx },
        { _id: { $in: ticketOrders } },
      ];
    }

    const [items, total, events] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean<Order[]>(),
      OrderModel.countDocuments(filter),
      EventModel.find().select("name").lean<{ _id: unknown; name: string }[]>(),
    ]);
    const eventName = new Map(events.map((e) => [String(e._id), e.name]));
    return {
      items: items.map((o) => ({ ...o, id: String(o._id), eventName: eventName.get(String(o.eventId)) ?? "—" })),
      total,
      page: params.page,
      pages: Math.max(1, Math.ceil(total / params.limit)),
    };
  },

  async detail(orderId: string) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId).lean()) as unknown as Order | null);
    const [tickets, event, payment] = await Promise.all([
      TicketModel.find({ orderId: order._id }).lean<Ticket[]>(),
      EventModel.findById(order.eventId).lean<Event | null>(),
      PaymentModel.findOne({ providerReference: order.paymentReference }).lean(),
    ]);
    const typeNames = new Map(
      (await TicketTypeModel.find({ eventId: order.eventId }).lean()).map((t) => [String(t._id), t.name]),
    );
    return { order, tickets, event, payment, typeNames: Object.fromEntries(typeNames) };
  },

  async markPaid(orderId: string, actor: AuthUser) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId)) as OrderDoc | null);
    if (order.status === "PAID") return { already: true };
    if (["REFUNDED", "CANCELLED"].includes(order.status))
      throw new ApiError("VALIDATION_ERROR", `This order is ${order.status.toLowerCase()} — it can't be marked paid.`, 400);
    order.status = "PAID";
    order.notes = order.notes ?? [];
    order.notes.push({ text: `Marked as paid by ${actor.name}`, author: actor.name, createdAt: new Date() });
    await order.save();
    await ticketService.issueTicketsForOrder(orderId);
    await ticketEmailService.sendAllForOrder(orderId);
    if (order.couponCode) await couponService.redeem(order.couponCode, order.discountAmount).catch(() => {});
    await waitlistService.markConverted(order.eventId, order.customerEmail).catch(() => {});
    return { already: false };
  },

  async refund(
    orderId: string,
    input: { amountKobo?: number; reason?: string },
    actor: AuthUser,
  ) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId)) as OrderDoc | null);
    if (order.status === "REFUNDED") throw new ApiError("VALIDATION_ERROR", "Already refunded.", 400);
    if (order.status !== "PAID") throw new ApiError("VALIDATION_ERROR", "Only paid orders can be refunded.", 400);

    const amount = Math.min(input.amountKobo ?? order.total, order.total - (order.refundedAmount ?? 0));
    if (amount <= 0) throw new ApiError("VALIDATION_ERROR", "Nothing left to refund.", 400);
    const full = amount >= order.total - (order.refundedAmount ?? 0);

    // Try the provider's refund API for card payments; fall back to a manual
    // refund record (cash/POS or when the API rejects).
    let providerRefund = false;
    if (order.paymentMethod === "paystack" && order.paymentReference) {
      try {
        await paystackService.refund({
          reference: order.paymentReference,
          amountKobo: amount,
          note: input.reason?.slice(0, 200),
        });
        providerRefund = true;
      } catch {
        providerRefund = false;
      }
    }

    order.refundedAmount = (order.refundedAmount ?? 0) + amount;
    order.refundReason = input.reason;
    order.notes = order.notes ?? [];
    order.notes.push({
      text: `${full ? "Full" : "Partial"} refund of ₦${(amount / 100).toLocaleString()} recorded${providerRefund ? " (Paystack)" : " (manual)"}${input.reason ? ` — ${input.reason}` : ""}`,
      author: actor.name,
      createdAt: new Date(),
    });

    if (full) {
      order.status = "REFUNDED";
      order.refundedAt = new Date();
      await order.save();
      // Give the seats back + void the tickets.
      await capacityService.releaseOrder(orderId);
      await TicketModel.updateMany({ orderId: order._id }, { $set: { status: "VOID" } });
      // Tell the waitlist something freed up — admin gets a notification anyway.
    } else {
      await order.save();
    }

    // Refund email — friendly, plain.
    try {
      const event = await EventModel.findById(order.eventId).lean<Event | null>();
      await emailTemplateService.sendTemplate("refund-confirmation", {
        to: order.customerEmail,
        meta: { orderId: String(order._id), eventId: String(order.eventId) },
        vars: {
          Name: order.customerName,
          Event: event?.name ?? "your order",
          Amount: `₦${(amount / 100).toLocaleString()}`,
        },
        fallbackSubject: `Refund for ${event?.name ?? "your order"}`,
        fallbackText: `Hi ${order.customerName},\n\nWe've ${full ? "refunded" : "partially refunded"} ₦${(amount / 100).toLocaleString()} for your order (${order.paymentReference}).\n\n${full ? "Your tickets are no longer valid for the event." : "Your tickets are still valid."}\n${input.reason ? `Reason: ${input.reason}\n` : ""}\nIt can take a few days to show on your statement.\n\n— SerenArt`,
      });
    } catch {
      // email failure shouldn't block the refund
    }

    return { refunded: amount, full, providerRefund };
  },

  async cancel(orderId: string, actor: AuthUser) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId)) as OrderDoc | null);
    if (order.status === "PAID")
      throw new ApiError("VALIDATION_ERROR", "This order is paid — refund it instead of cancelling.", 400);
    if (["CANCELLED", "REFUNDED"].includes(order.status))
      throw new ApiError("VALIDATION_ERROR", "Already closed.", 400);
    order.status = "CANCELLED";
    order.notes = order.notes ?? [];
    order.notes.push({ text: `Cancelled by ${actor.name}`, author: actor.name, createdAt: new Date() });
    await order.save();
    await capacityService.releaseOrder(orderId);
    await TicketModel.updateMany({ orderId: order._id }, { $set: { status: "VOID" } });
    return true;
  },

  async updateBuyer(orderId: string, input: { name?: string; email?: string; phone?: string }, actor: AuthUser) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId)) as OrderDoc | null);
    if (input.name) order.customerName = input.name;
    if (input.email) order.customerEmail = input.email;
    if (input.phone !== undefined) order.customerPhone = input.phone;
    order.notes = order.notes ?? [];
    order.notes.push({ text: `Buyer details updated by ${actor.name}`, author: actor.name, createdAt: new Date() });
    await order.save();
    // Keep ticket holders in sync.
    if (input.name || input.email) {
      await TicketModel.updateMany(
        { orderId: order._id },
        { $set: { ...(input.name ? { holderName: input.name } : {}), ...(input.email ? { holderEmail: input.email } : {}) } },
      );
    }
    return true;
  },

  async addNote(orderId: string, text: string, actor: AuthUser) {
    await connectDb();
    const res = await OrderModel.updateOne(
      { _id: orderId },
      { $push: { notes: { text, author: actor.name, createdAt: new Date() } } },
    );
    if (!res.matchedCount) throw new ApiError("ORDER_NOT_FOUND", "Order not found", 404);
    return true;
  },

  async resendTickets(orderId: string) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId).lean()) as unknown as Order | null);
    if (order.status !== "PAID") throw new ApiError("VALIDATION_ERROR", "Tickets only exist once the order is paid.", 400);
    return ticketEmailService.sendAllForOrder(orderId, { force: true });
  },

  async reverify(orderId: string) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId).lean()) as unknown as Order | null);
    if (order.paymentMethod !== "paystack")
      throw new ApiError("VALIDATION_ERROR", "Only online payments can be re-verified.", 400);
    return paymentService.confirmPaystackPayment(order.paymentReference);
  },

  // Manual sale — cash / transfer / POS / complimentary. Reserves capacity,
  // marks paid, mints tickets and emails them.
  async manualSale(
    input: {
      eventId: string;
      items: { ticketTypeId: string; quantity: number }[];
      customer: { name: string; email: string; phone?: string };
      method: "cash" | "transfer" | "pos" | "complimentary";
      note?: string;
    },
    actor: AuthUser,
  ) {
    await connectDb();
    const event = await EventModel.findById(input.eventId).lean<Event | null>();
    if (!event) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);

    const types = (await TicketTypeModel.find({
      _id: { $in: input.items.map((i) => i.ticketTypeId) },
      eventId: event._id,
    }).lean()) as unknown as TicketTypeDoc[];
    if (types.length !== input.items.length)
      throw new ApiError("TICKET_TYPE_NOT_FOUND", "Invalid ticket type(s)", 400);

    const subtotal = input.items.reduce((a, i) => {
      const t = types.find((x) => String(x._id) === i.ticketTypeId)!;
      return a + t.price * i.quantity;
    }, 0);

    await capacityService.reserve(input.items);

    const total = input.method === "complimentary" ? 0 : subtotal;
    const ref = `MAN-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
    try {
      const order = await OrderModel.create({
        eventId: event._id,
        items: input.items.map((i) => {
          const t = types.find((x) => String(x._id) === i.ticketTypeId)!;
          return { ticketTypeId: t._id, name: t.name, unitPrice: t.price, quantity: i.quantity, currency: t.currency };
        }),
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerPhone: input.customer.phone,
        status: "PAID",
        subtotal,
        fees: 0,
        total,
        currency: "NGN",
        paymentReference: ref,
        paymentMethod: input.method,
        manual: true,
        soldBy: actor.name,
        notes: input.note ? [{ text: input.note, author: actor.name, createdAt: new Date() }] : [],
      });
      await ticketService.issueTicketsForOrder(String(order._id));
      await ticketEmailService.sendAllForOrder(String(order._id));
      await waitlistService.markConverted(order.eventId, order.customerEmail).catch(() => {});
      return order.toObject();
    } catch (e) {
      await capacityService.release(input.items.map((i) => ({ ticketTypeId: new Types.ObjectId(i.ticketTypeId), quantity: i.quantity })));
      throw e;
    }
  },

  // Move an order's tickets to another person (name/email) or another event
  // (pick a ticket type on the target event; capacity moves with it).
  async transfer(
    orderId: string,
    input: { toName?: string; toEmail?: string; toEventId?: string; toTicketTypeId?: string },
    actor: AuthUser,
  ) {
    await connectDb();
    const order = assertFound((await OrderModel.findById(orderId)) as OrderDoc | null);
    if (order.status !== "PAID") throw new ApiError("VALIDATION_ERROR", "Only paid orders can be transferred.", 400);

    if (input.toEventId) {
      if (!input.toTicketTypeId) throw new ApiError("VALIDATION_ERROR", "Pick a ticket type on the new event.", 400);
      const target = (await TicketTypeModel.findOne({ _id: input.toTicketTypeId, eventId: input.toEventId }).lean()) as TicketTypeDoc | null;
      if (!target) throw new ApiError("TICKET_TYPE_NOT_FOUND", "Ticket type not found on that event", 404);
      const totalQty = order.items.reduce((a, i) => a + i.quantity, 0);
      await capacityService.reserve([{ ticketTypeId: input.toTicketTypeId, quantity: totalQty }]);
      await capacityService.release(order.items.map((i) => ({ ticketTypeId: i.ticketTypeId, quantity: i.quantity })));
      order.eventId = new Types.ObjectId(input.toEventId);
      order.set("items", [{ ticketTypeId: target._id, name: target.name, unitPrice: target.price, quantity: totalQty, currency: target.currency }]);
      await order.save();
      await TicketModel.updateMany({ orderId: order._id }, { $set: { eventId: order.eventId, ticketTypeId: target._id } });
      order.notes.push({ text: `Moved to another event (${target.name}) by ${actor.name}`, author: actor.name, createdAt: new Date() });
      await order.save();
    }

    if (input.toName || input.toEmail) {
      if (input.toName) order.customerName = input.toName;
      if (input.toEmail) order.customerEmail = input.toEmail;
      order.transferredTo = [input.toName, input.toEmail].filter(Boolean).join(" / ");
      order.notes.push({ text: `Transferred to ${order.transferredTo} by ${actor.name}`, author: actor.name, createdAt: new Date() });
      await order.save();
      await TicketModel.updateMany(
        { orderId: order._id },
        { $set: { ...(input.toName ? { holderName: input.toName } : {}), ...(input.toEmail ? { holderEmail: input.toEmail } : {}) } },
      );
    }

    // Fresh tickets to the new email.
    await ticketEmailService.sendAllForOrder(String(order._id), { force: true });
    return true;
  },
};
