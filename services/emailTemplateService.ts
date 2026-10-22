import { connectDb } from "@/lib/db";
import { EmailTemplateModel, type EmailTemplate } from "@/models/emailTemplate";
import { emailService } from "@/services/emailService";

// Default copy mirrors what the code sent before templates existed.
export const DEFAULT_TEMPLATES: Omit<EmailTemplate, "_id" | "createdAt" | "updatedAt">[] = [
  {
    key: "ticket-confirmation",
    name: "Ticket confirmation",
    description: "Sent the moment a payment is confirmed. The QR tickets are attached separately — this is the friendly hello.",
    subject: "Your ticket for [Event]",
    body: "Hi [Name],\n\nYou're in! Your tickets for [Event] on [Date] at [Time] are attached — show the QR code at the door.\n\n[Venue]\n\nSee you there.",
    enabled: true,
    timingDays: 2,
  },
  {
    key: "event-reminder",
    name: "Event reminder",
    description: "Sent to paid guests a couple of days before the event. Set the timing below.",
    subject: "See you soon! [Event]",
    body: "Hi [Name],\n\n[Event] is on [Day] at [Time][Venue].\n\nBring your ticket and a good mood — your tickets are attached to your confirmation email.\n\nCan't wait.",
    enabled: true,
    timingDays: 2,
  },
  {
    key: "waitlist-notice",
    name: "Waitlist: spot opened",
    description: "Sent when you notify people on an event's waitlist.",
    subject: "A spot opened for [Event]",
    body: "Hi [Name],\n\nGood news — a spot just opened for [Event].\n\nGrab it before it goes: [Link]\n\nSee you there.",
    enabled: true,
    timingDays: 2,
  },
  {
    key: "refund-confirmation",
    name: "Refund confirmation",
    description: "Sent when a refund is issued from an order.",
    subject: "Refund for [Event]",
    body: "Hi [Name],\n\nWe've processed your refund of [Amount] for [Event]. It should land back on your original payment method within 5-10 working days.\n\nSorry you can't make it — hope to see you at a future one.",
    enabled: true,
    timingDays: 2,
  },
  {
    key: "enquiry-received",
    name: "Enquiry received (auto-reply)",
    description: "Reassures the guest their enquiry landed. Sent alongside the internal notification.",
    subject: "We got your enquiry — [Occasion]",
    body: "Hi [Name],\n\nThanks for reaching out about [Occasion]! We've got your enquiry and we'll reach out [ResponseTime] to talk it through.\n\nTalk soon,\nSerenArt",
    enabled: false,
    timingDays: 2,
  },
  {
    key: "subscriber-announcement",
    name: "Subscriber announcement",
    description: "Used by the 'Email subscribers about an event' action on the Subscribers page.",
    subject: "[Event] — tickets are live",
    body: "Hi [Name],\n\n[Event] is on [Date] at [Venue] — and we thought you'd want to know first.\n\n[Link]\n\nHope to see you there.",
    enabled: true,
    timingDays: 2,
  },
];

function substitute(text: string, vars: Record<string, string>) {
  return text.replace(/\[(\w+)\]/g, (m, key: string) => vars[key] ?? m);
}

export const emailTemplateService = {
  async list(): Promise<EmailTemplate[]> {
    await connectDb();
    // Auto-seed defaults for keys that don't exist yet.
    const existing = await EmailTemplateModel.find().lean<EmailTemplate[]>();
    const have = new Set(existing.map((t) => t.key));
    const missing = DEFAULT_TEMPLATES.filter((t) => !have.has(t.key));
    if (missing.length) {
      try {
        await EmailTemplateModel.insertMany(missing);
      } catch { /* race-safe */ }
      return EmailTemplateModel.find().lean<EmailTemplate[]>();
    }
    return existing;
  },

  async get(key: string): Promise<EmailTemplate | null> {
    await connectDb();
    return EmailTemplateModel.findOne({ key }).lean<EmailTemplate | null>();
  },

  async update(key: string, input: Partial<Pick<EmailTemplate, "subject" | "body" | "enabled" | "timingDays" | "name" | "description">>) {
    await connectDb();
    await EmailTemplateModel.updateOne({ key }, { $set: input }, { upsert: true });
  },

  // If the template exists and is enabled, send the rendered version.
  // Returns true when the template handled it — callers fall back to their
  // built-in copy otherwise.
  async sendTemplate(
    key: string,
    args: {
      to: string;
      vars: Record<string, string>;
      meta?: Record<string, unknown>;
      fallbackSubject: string;
      fallbackHtml?: string;
      fallbackText?: string;
    },
  ): Promise<unknown> {
    const tpl = await this.get(key).catch(() => null);
    if (tpl && tpl.enabled) {
      return emailService.send({
        to: args.to,
        subject: substitute(tpl.subject, args.vars),
        text: substitute(tpl.body, args.vars),
        template: key,
        meta: args.meta,
      });
    }
    return emailService.send({
      to: args.to,
      subject: args.fallbackSubject,
      html: args.fallbackHtml,
      text: args.fallbackText,
      template: key,
      meta: args.meta,
    });
  },

  async sendTest(key: string, to: string) {
    const tpl = await this.get(key);
    if (!tpl) throw new Error("Template not found");
    const sample: Record<string, string> = {
      Name: "Ada",
      Event: "Sip & Paint: Sunset Edition",
      Day: "Saturday",
      Date: "Saturday 21 June",
      Time: "4:00 PM",
      Venue: "The Garden, Ikoyi",
      Amount: "₦15,000",
      Occasion: "a birthday hangout",
      ResponseTime: "within a day",
      Link: "https://example.com/events/sample",
    };
    return emailService.send({
      to,
      subject: `[TEST] ${substitute(tpl.subject, sample)}`,
      text: substitute(tpl.body, sample),
      template: `${key} (test)`,
    });
  },
};
