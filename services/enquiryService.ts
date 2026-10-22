import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";
import { EnquiryModel } from "@/models/enquiry";
import { WaitlistEntryModel } from "@/models/waitlistEntry";
import { SubscriberModel } from "@/models/subscriber";
import { EventModel } from "@/models/event";
import { emailService } from "@/services/emailService";
import { settingsService } from "@/services/settingsService";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const enquiryService = {
  async create(
    input: Record<string, unknown> & { kind: string; email: string },
  ) {
    let saved: { id: string } | null = null;
    let dbError: unknown = null;

    try {
      await connectDb();

      // Waitlist signups get their own collection so the admin can manage them
      // per-event with a real lifecycle — the enquiry row is still kept.
      if (input.kind === "waitlist" && input.eventSlug) {
        const ev = await EventModel.findOne({
          slug: String(input.eventSlug),
        }).lean<{ _id: unknown } | null>();
        if (ev) {
          await WaitlistEntryModel.findOneAndUpdate(
            { eventId: ev._id, email: input.email },
            {
              $setOnInsert: {
                eventId: ev._id,
                email: input.email,
                name: input.name || input.email.split("@")[0],
                phone: input.phone || undefined,
                status: "waiting",
              },
            },
            { upsert: true },
          );
        }
      }

      // Footer / empty-state email captures land in the subscriber list.
      if (input.kind === "updates") {
        await SubscriberModel.findOneAndUpdate(
          { email: input.email, source: input.city ? "empty-state" : "footer" },
          {
            $setOnInsert: {
              email: input.email,
              source: input.city ? "empty-state" : "footer",
              city: input.city || undefined,
              status: "subscribed",
            },
          },
          { upsert: true },
        );
      }

      const doc = await EnquiryModel.create(input);
      saved = { id: String(doc._id) };
    } catch (e) {
      dbError = e;
    }

    let emailed = false;
    try {
      const settings = await settingsService.getPublic();
      const recipients = settings.enquiryNotifyEmails.filter(Boolean);
      if (!recipients.length && env.ENQUIRY_NOTIFY_EMAIL)
        recipients.push(env.ENQUIRY_NOTIFY_EMAIL);
      if (recipients.length) {
        const rows = Object.entries(input)
          .filter(([k, v]) => k !== "meta" && v != null && String(v).trim() !== "")
          .map(
            ([k, v]) =>
              `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${escapeHtml(
                k,
              )}</td><td style="padding:4px 0">${escapeHtml(String(v))}</td></tr>`,
          )
          .join("");
        const res = (await emailService.send({
          to: recipients.join(","),
          subject: `New ${input.kind} enquiry — ${input.email}`,
          html: `<h2>New ${escapeHtml(input.kind)} enquiry</h2><table>${rows}</table>`,
          template: "enquiry-notification",
          meta: { kind: input.kind, email: input.email },
        })) as { accepted?: string[] };
        emailed = (res?.accepted?.length ?? 0) > 0;
      }
    } catch {
      emailed = false;
    }

    if (!saved && !emailed) {
      console.error("[ENQUIRY] could not store or deliver enquiry", dbError);
      throw new ApiError(
        "ENQUIRY_FAILED",
        "We couldn't send your enquiry right now. Please try WhatsApp instead.",
        503,
      );
    }

    return { id: saved?.id ?? null, emailed };
  },
};
