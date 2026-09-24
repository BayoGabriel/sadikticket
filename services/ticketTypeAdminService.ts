import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel, type TicketType } from "@/models/ticketType";
import { Types } from "mongoose";

export const ticketTypeAdminService = {
  async assertEventAccess(eventId: string, user: { id: string; role: string }) {
    await connectDb();
    const event = await EventModel.findById(eventId).lean<Event | null>();
    if (!event) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    if (user.role === "SUPER_ADMIN") return event;
    if (user.role === "EVENT_ADMIN" && String(event.createdBy) === user.id)
      return event;
    throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
  },

  async create(eventId: string, input: any) {
    await connectDb();
    const doc = await TicketTypeModel.create({
      eventId: new Types.ObjectId(eventId),
      name: input.name,
      description: input.description,
      price: input.price,
      currency: input.currency,
      quantity: input.quantity,
      quantitySold: 0,
      salesStart: input.salesStart ?? null,
      salesEnd: input.salesEnd ?? null,
      status: input.status ?? "ACTIVE",
    });
    return doc.toObject();
  },

  async list(eventId: string, page: number, limit: number) {
    await connectDb();
    const [items, total] = await Promise.all([
      TicketTypeModel.find({ eventId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean<TicketType[]>(),
      TicketTypeModel.countDocuments({ eventId }),
    ]);
    return { items, total };
  },

  async get(eventId: string, ticketTypeId: string) {
    await connectDb();
    const tt = await TicketTypeModel.findOne({
      _id: ticketTypeId,
      eventId,
    }).lean<TicketType | null>();
    if (!tt)
      throw new ApiError("TICKET_TYPE_NOT_FOUND", "Ticket type not found", 404);
    return tt;
  },

  async update(eventId: string, ticketTypeId: string, patch: any) {
    await connectDb();
    const tt = await TicketTypeModel.findOne({ _id: ticketTypeId, eventId });
    if (!tt)
      throw new ApiError("TICKET_TYPE_NOT_FOUND", "Ticket type not found", 404);
    Object.assign(tt, patch);
    await tt.save();
    return tt.toObject();
  },

  async remove(eventId: string, ticketTypeId: string) {
    await connectDb();
    const res = await TicketTypeModel.deleteOne({ _id: ticketTypeId, eventId });
    if (res.deletedCount === 0)
      throw new ApiError("TICKET_TYPE_NOT_FOUND", "Ticket type not found", 404);
    return true;
  },
};
