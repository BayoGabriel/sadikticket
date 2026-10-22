import crypto from "crypto";
import { connectDb } from "@/lib/db";
import { SubscriberModel, type Subscriber } from "@/models/subscriber";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { emailService } from "@/services/emailService";
import { env } from "@/lib/env";
import { formatNaira } from "@/lib/format";

// Signed unsubscribe links — no account needed, but can't be forged.
export function unsubscribeToken(email: string) {
  return crypto.createHmac("sha256", env.JWT_SECRET).update(email.toLowerCase()).digest("hex").slice(0, 24);
}
export function unsubscribeUrl(email: string) {
  return `${env.APP_URL}/unsubscribe?email=${encodeURIComponent(email)}&sig=${unsubscribeToken(email)}`;
}

export const subscriberService = {
  async list(params: { q?: string; city?: string; source?: string; status?: string; page: number; limit: number }) {
    await connectDb();
    const filter: Record<string, unknown> = {};
    if (params.city) filter.city = params.city;
    if (params.source) filter.source = params.source;
    if (params.status) filter.status = params.status;
    else filter.status = { $ne: "removed" };
    if (params.q) filter.email = { $regex: params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

    const [items, total] = await Promise.all([
      SubscriberModel.find(filter).sort({ createdAt: -1 }).skip((params.page - 1) * params.limit).limit(params.limit).lean<Subscriber[]>(),
      SubscriberModel.countDocuments(filter),
    ]);
    return { items, total, page: params.page, pages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  async subscribe(email: string, source: string, city?: string) {
    await connectDb();
    const existing = await SubscriberModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "subscribed";
        existing.unsubscribedAt = undefined;
        await existing.save();
      }
      return existing;
    }
    return SubscriberModel.create({ email: email.toLowerCase(), source, city });
  },

  async unsubscribe(email: string, sig: string) {
    await connectDb();
    if (sig !== unsubscribeToken(email)) return false;
    await SubscriberModel.updateMany(
      { email: email.toLowerCase() },
      { $set: { status: "unsubscribed", unsubscribedAt: new Date() } },
    );
    return true;
  },

  async remove(ids: string[]) {
    await connectDb();
    await SubscriberModel.deleteMany({ _id: { $in: ids } });
  },

  // CSV import — one email per line (or `email,city` columns). Upserts.
  async importRows(rows: { email: string; city?: string; source?: string }[]) {
    await connectDb();
    let added = 0;
    for (const r of rows) {
      const email = r.email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) continue;
      const res = await SubscriberModel.updateOne(
        { email },
        { $setOnInsert: { email, source: r.source || "manual", city: r.city, status: "subscribed" } },
        { upsert: true },
      );
      if (res.upsertedCount) added += 1;
    }
    return added;
  },

  // "Email subscribers about an event" — batched branded announcement.
  async broadcast(params: { eventId: string; city?: string; subject?: string; intro?: string }) {
    await connectDb();
    const event = await EventModel.findById(params.eventId).lean<Event | null>();
    if (!event) throw new Error("Event not found");
    const types = await TicketTypeModel.find({ eventId: event._id, status: "ACTIVE" }).sort({ price: 1 }).lean();
    const from = types[0] ? formatNaira(types[0].price) : "";
    const day = event.startsAt.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
    const link = `${env.APP_URL}/events/${event.slug}`;

    const filter: Record<string, unknown> = { status: "subscribed" };
    if (params.city) filter.city = params.city;
    const subs = await SubscriberModel.find(filter).lean<Subscriber[]>();

    let sent = 0;
    for (const s of subs) {
      try {
        await emailService.send({
          to: s.email,
          subject: params.subject || `${event.name} — tickets are live`,
          template: "subscriber-announcement",
          meta: { eventId: String(event._id) },
          text: `${params.intro || `Something new on the calendar.`}\n\n${event.name}\n${day}${event.venueName ? ` · ${event.venueName}` : ""}${event.city ? `, ${event.city}` : ""}${from ? `\nFrom ${from}` : ""}\n\nGet your ticket: ${link}\n\n— SerenArt\n\nDon't want these? Unsubscribe: ${unsubscribeUrl(s.email)}`,
        });
        sent += 1;
      } catch {
        // one bad address shouldn't stop the broadcast
      }
    }
    return { sent, total: subs.length };
  },

  async cityCounts() {
    await connectDb();
    const rows = await SubscriberModel.aggregate<{ _id: string; n: number }>([
      { $match: { status: "subscribed" } },
      { $group: { _id: "$city", n: { $sum: 1 } } },
    ]);
    return rows;
  },
};
