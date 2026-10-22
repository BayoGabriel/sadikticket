import { connectDb } from "@/lib/db";
import { TicketModel, type Ticket } from "@/models/ticket";
import { OrderModel } from "@/models/order";
import { CheckInModel } from "@/models/checkIn";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { Types } from "mongoose";
import type { AuthUser } from "@/lib/auth";

export type ScanResult =
  | { ok: true; name: string; ticketType: string; remaining: number }
  | { ok: false; reason: "already" | "wrong-event" | "unpaid" | "void" | "invalid"; message: string; checkedInAt?: Date; name?: string };

export const checkinService = {
  // The token a door scanner reads can be the QR payload or a typed ticket code.
  async scan(token: string, eventId: string, actor: AuthUser | { id: string; name: string }): Promise<ScanResult> {
    await connectDb();
    const ticket = await TicketModel.findOne({
      $or: [{ qrToken: token }, { ticketCode: token.trim().toUpperCase() }],
    }).lean<Ticket | null>();
    if (!ticket) return { ok: false, reason: "invalid", message: "That ticket doesn't exist." };

    const order = await OrderModel.findById(ticket.orderId).lean<{ status: string } | null>();
    if (!order || order.status !== "PAID") {
      const s = order?.status ?? "unpaid";
      return {
        ok: false,
        reason: s === "REFUNDED" ? "void" : "unpaid",
        message: s === "REFUNDED" ? "This ticket was refunded." : s === "CANCELLED" ? "This order was cancelled." : "This order isn't paid.",
        name: ticket.holderName,
      };
    }
    if (ticket.status === "VOID")
      return { ok: false, reason: "void", message: "This ticket is no longer valid.", name: ticket.holderName };
    if (String(ticket.eventId) !== String(eventId))
      return { ok: false, reason: "wrong-event", message: "That's a ticket for a different event.", name: ticket.holderName };
    if (ticket.status === "CHECKED_IN")
      return { ok: false, reason: "already", message: "Already checked in", checkedInAt: ticket.checkedInAt ?? undefined, name: ticket.holderName };

    // Atomic transition — two devices scanning the same QR can never double-check.
    const res = await TicketModel.updateOne(
      { _id: ticket._id, status: "ISSUED" },
      { $set: { status: "CHECKED_IN", checkedInAt: new Date() } },
    );
    if (res.modifiedCount === 0)
      return { ok: false, reason: "already", message: "Already checked in", name: ticket.holderName };

    await CheckInModel.create({
      ticketId: ticket._id,
      eventId: new Types.ObjectId(eventId),
      staffUserId: new Types.ObjectId(actor.id),
      method: "QR_SCAN",
    });
    const remaining = await TicketModel.countDocuments({ eventId, status: "ISSUED" });
    return { ok: true, name: ticket.holderName, ticketType: "", remaining };
  },

  async undo(ticketIdOrCode: string, _actor?: AuthUser | { id: string; name: string }) {
    void _actor;
    await connectDb();
    const ticket = await TicketModel.findOneAndUpdate(
      {
        $or: [{ _id: ticketIdOrCode }, { ticketCode: ticketIdOrCode.toUpperCase() }, { qrToken: ticketIdOrCode }],
        status: "CHECKED_IN",
      },
      { $set: { status: "ISSUED", checkedInAt: null } },
      { new: true },
    ).lean<Ticket | null>();
    if (ticket) {
      await CheckInModel.deleteMany({ ticketId: ticket._id }).catch(() => {});
    }
    return !!ticket;
  },

  // Attendee list + live counter for an event.
  async eventState(eventId: string, q?: string) {
    await connectDb();
    const tickets = await TicketModel.find({ eventId }).sort({ holderName: 1 }).lean<Ticket[]>();
    const orders = await OrderModel.find({ _id: { $in: tickets.map((t) => t.orderId) } })
      .lean<{ _id: Types.ObjectId; status: string; customerPhone?: string }[]>();
    const orderMap = new Map(orders.map((o) => [String(o._id), o]));
    const types = new Map(
      (await TicketTypeModel.find({ eventId }).lean()).map((t) => [String(t._id), t.name]),
    );

    let rows = tickets
      .filter((t) => orderMap.get(String(t.orderId))?.status === "PAID")
      .map((t) => ({
        id: String(t._id),
        code: t.ticketCode,
        name: t.holderName,
        email: t.holderEmail,
        phone: orderMap.get(String(t.orderId))?.customerPhone ?? "",
        type: types.get(String(t.ticketTypeId)) ?? "Ticket",
        status: t.status,
        checkedInAt: t.checkedInAt,
      }));
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      rows = rows.filter((r) => rx.test(r.name) || rx.test(r.email) || rx.test(r.code) || rx.test(r.phone));
    }
    const paid = rows.filter((r) => r.status !== "VOID");
    return {
      attendees: rows,
      total: paid.length,
      checkedIn: paid.filter((r) => r.status === "CHECKED_IN").length,
      remaining: paid.filter((r) => r.status === "ISSUED").length,
    };
  },

  async todaysEvents() {
    await connectDb();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 864e5);
    return EventModel.find({ startsAt: { $gte: start, $lt: end }, status: "PUBLISHED" })
      .lean<Event[]>();
  },
};
