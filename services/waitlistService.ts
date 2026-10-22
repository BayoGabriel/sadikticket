import { connectDb } from "@/lib/db";
import { WaitlistEntryModel, type WaitlistEntry } from "@/models/waitlistEntry";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { Types } from "mongoose";
import { emailService } from "@/services/emailService";
import { env } from "@/lib/env";

export const waitlistService = {
  async list(eventId?: string, status?: string) {
    await connectDb();
    const filter: Record<string, unknown> = {};
    if (eventId) filter.eventId = new Types.ObjectId(eventId);
    if (status) filter.status = status;
    const [items, events] = await Promise.all([
      WaitlistEntryModel.find(filter).sort({ createdAt: 1 }).lean<WaitlistEntry[]>(),
      EventModel.find().select("name slug").lean(),
    ]);
    const names = new Map(events.map((e) => [String(e._id), e.name]));
    return items.map((w) => ({ ...w, eventName: names.get(String(w.eventId)) ?? "—" }));
  },

  // Email the next `count` people (or everyone when count is undefined) that
  // a spot freed up. Marks them notified so they aren't spammed twice.
  async notify(eventId: string, count?: number) {
    await connectDb();
    const event = await EventModel.findById(eventId).lean<Event | null>();
    if (!event) throw new Error("Event not found");

    const waiting = await WaitlistEntryModel.find({ eventId, status: { $in: ["waiting", "notified"] } })
      .sort({ createdAt: 1 })
      .limit(count ?? 1000)
      .lean<WaitlistEntry[]>();

    let sent = 0;
    for (const w of waiting) {
      try {
        await emailService.send({
          to: w.email,
          subject: `A spot opened for ${event.name}`,
          template: "waitlist-notice",
          meta: { eventId: String(event._id) },
          text: `Hi ${w.name},\n\nGood news — a spot opened up for ${event.name}. You asked us to tell you first, so grab it before it goes:\n\n${env.APP_URL}/events/${event.slug}\n\n— SerenArt`,
        });
        await WaitlistEntryModel.updateOne(
          { _id: w._id, status: "waiting" },
          { $set: { status: "notified", notifiedAt: new Date() } },
        );
        sent += 1;
      } catch {
        // keep going — one bad address shouldn't stop the rest
      }
    }
    return { notified: sent, total: waiting.length };
  },

  // When a PAID order lands, flip that person's waitlist entry to converted.
  async markConverted(eventId: string | Types.ObjectId, email: string) {
    await WaitlistEntryModel.updateMany(
      { eventId, email, status: { $in: ["waiting", "notified"] } },
      { $set: { status: "converted", convertedAt: new Date() } },
    );
  },

  async remove(ids: string[]) {
    await connectDb();
    await WaitlistEntryModel.updateMany(
      { _id: { $in: ids.map((i) => new Types.ObjectId(i)) } },
      { $set: { status: "removed" } },
    );
  },

  async add(eventId: string, input: { name: string; email: string; phone?: string }) {
    await connectDb();
    const existing = await WaitlistEntryModel.findOne({ eventId, email: input.email });
    if (existing) {
      if (existing.status === "removed" || existing.status === "converted") {
        existing.status = "waiting";
        existing.notifiedAt = undefined;
        await existing.save();
      }
      return existing;
    }
    return WaitlistEntryModel.create({ eventId: new Types.ObjectId(eventId), ...input });
  },

  // Seats currently available + waiting count — powers the "X tickets freed
  // up. Notify the waitlist?" banner.
  async freedInfo(eventId: string) {
    await connectDb();
    const types = await TicketTypeModel.find({ eventId, status: "ACTIVE" }).lean();
    const freed = types.reduce((a, t) => a + Math.max(0, (t.quantity ?? 0) - (t.quantitySold ?? 0)), 0);
    const waiting = await WaitlistEntryModel.countDocuments({ eventId, status: "waiting" });
    return { freed, waiting };
  },

  async countsByEvent() {
    await connectDb();
    const rows = await WaitlistEntryModel.aggregate<{ _id: Types.ObjectId; waiting: number }>([
      { $match: { status: "waiting" } },
      { $group: { _id: "$eventId", waiting: { $sum: 1 } } },
    ]);
    return new Map(rows.map((r) => [String(r._id), r.waiting]));
  },
};
