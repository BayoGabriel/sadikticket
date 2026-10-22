import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/models/order";
import { EventModel, type Event } from "@/models/event";
import { emailTemplateService } from "@/services/emailTemplateService";
import { capacityService } from "@/services/capacityService";
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
    // Reminder window comes from the editable template (default 2 days out).
    const tpl = await emailTemplateService.get("event-reminder").catch(() => null);
    const timingDays = tpl?.timingDays ?? 2;
    const windowEnd = new Date(now.getTime() + timingDays * 24 * 3600 * 1000);
    if (tpl && !tpl.enabled) {
      return Response.json({ ok: true, sent: 0, skipped: "template disabled" });
    }

    const events = await EventModel.find({
      status: "PUBLISHED",
      startsAt: { $gte: now, $lte: windowEnd },
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
          await emailTemplateService.sendTemplate("event-reminder", {
            to: order.customerEmail,
            meta: { orderId: String(order._id), eventId: String(event._id) },
            vars: {
              Name: order.customerName,
              Event: event.name,
              Day: day,
              Time: time,
              Venue: event.venueName ? `, ${event.venueName}` : "",
              Link: `${env.APP_URL}/tickets/${order._id}`,
            },
            fallbackSubject: `See you soon! ${event.name}`,
            fallbackHtml: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#111">
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

    // Same run: free seats held by abandoned checkouts (idempotent).
    const expired = await capacityService.releaseStalePending().catch(() => 0);

    return Response.json({ ok: true, events: events.length, sent, expired });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
