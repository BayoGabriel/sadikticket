import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { EventModel, type Event } from "@/models/event";
import { EnquiryModel, type Enquiry } from "@/models/enquiry";
import { emailService } from "@/services/emailService";
import { env } from "@/lib/env";

// POST /api/v1/admin/events/[eventId]/notify-waitlist
// Emails everyone on the event's waitlist that tickets freed up.
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string }> },
) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    await connectDb();

    const event = await EventModel.findById(eventId).lean<Event | null>();
    if (!event) throw new Error("Event not found");

    const entries = await EnquiryModel.find({
      kind: "waitlist",
      eventSlug: event.slug,
    }).lean<Enquiry[]>();

    let sent = 0;
    for (const e of entries) {
      try {
        await emailService.sendTicketEmail({
          to: e.email,
          subject: `A ticket freed up — ${event.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:640px;color:#111">
            <h2>Good news — a spot opened for ${event.name}</h2>
            <p>You asked us to tell you first. Grab your ticket before it goes:</p>
            <p><a href="${env.APP_URL}/events/${event.slug}">Get your ticket</a></p>
          </div>`,
        });
        sent += 1;
      } catch {
        // keep going — one bad address shouldn't stop the rest
      }
    }

    return ok({ notified: sent, total: entries.length });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
