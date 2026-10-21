import { connectDb } from "@/lib/db";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";
import { EnquiryModel } from "@/models/enquiry";
import { emailService } from "@/services/emailService";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const enquiryService = {
  async create(input: Record<string, unknown> & { kind: string; email: string }) {
    let saved: { id: string } | null = null;
    let dbError: unknown = null;

    try {
      await connectDb();
      const doc = await EnquiryModel.create(input);
      saved = { id: String(doc._id) };
    } catch (e) {
      dbError = e;
    }

    let emailed = false;
    if (env.ENQUIRY_NOTIFY_EMAIL) {
      const rows = Object.entries(input)
        .filter(([k, v]) => k !== "meta" && v != null && String(v).trim() !== "")
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${escapeHtml(
              k,
            )}</td><td style="padding:4px 0">${escapeHtml(String(v))}</td></tr>`,
        )
        .join("");
      try {
        const res = await emailService.sendTicketEmail({
          to: env.ENQUIRY_NOTIFY_EMAIL,
          subject: `New ${input.kind} enquiry — ${input.email}`,
          html: `<h2>New ${escapeHtml(input.kind)} enquiry</h2><table>${rows}</table>`,
        });
        emailed = (res.accepted?.length ?? 0) > 0;
      } catch {
        emailed = false;
      }
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
