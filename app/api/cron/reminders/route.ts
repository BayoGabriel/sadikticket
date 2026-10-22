import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { EventModel, type Event } from "@/models/event";
import { emailService } from "@/services/emailService";
import { env } from "@/lib/env";

// GET /api/cron/reminders — Vercel Cron (see vercel.json).
// Sends "See you soon!" reminders ~2 days before each event to PAID orders.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectDb();

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
    const in72h = new Date(now.getTime() + 72 * 3600 * 1000);

    const events = await EventModel.find({
      status: "PUBLISHED",
      startsAt: { $gte: in24h, $lte: in72h },
    }).lean<Event[]>();

    let sent = 0;
    for (const event of events) {
      const orders = await OrderModel.find({
        eventId: event._id,
        status: "PAID",
        reminderSentAt: { $exists: false },
      });

      for (const order of orders) {
        const day = event.startsAt.toLocaleDateString("en-NG", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
        const time = event.startsAt.toLocaleTimeString("en-NG", {
          hour: "numeric",
          minute: "2-digit",
        });
        try {
          await emailService.sendTicketEmail({
            to: order.customerEmail,
            subject: `See you soon! ${event.name}`,
            html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#111">
              <h2>See you soon!</h2>
              <p>${event.name} is on ${day} at ${time}${event.venueName ? `, ${event.venueName}` : ""}.</p>
              <p>Bring your ticket and a good mood.</p>
              <p><a href="${env.APP_URL}/tickets/${order._id}">View your tickets</a></p>
            </div>`,
          });
          order.reminderSentAt = new Date();
          await order.save();
          sent += 1;
        } catch {
          // leave reminderSentAt unset so the next cron run retries
        }
      }
    }

    return Response.json({ ok: true, events: events.length, sent });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
