import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  title: "FAQs | SerenArt",
  description: "Quick answers about SerenArt events, tickets and bookings.",
};

const faqs = [
  {
    q: "Do I need to be good at art?",
    a: "Not at all. Our hosts guide you step by step.",
  },
  {
    q: "Can I come alone?",
    a: "Yes. Plenty of people do and leave with new friends.",
  },
  {
    q: "What's included in my ticket?",
    a: "Everything listed on the event page under “What's included” — typically all materials plus a drink and a snack. Check your event for the exact list.",
  },
  {
    q: "Can I bring my own drinks or food?",
    a: "It depends on the venue. Check the event page or ask us on WhatsApp before the day.",
  },
  {
    q: "Is there an age limit?",
    a: "It depends on the event. The event page lists any age limits — when in doubt, ask us.",
  },
  {
    q: "Can I get a refund?",
    a: "Plans change. See our Refunds and Cancellations page for the full policy, or ask us on WhatsApp.",
    link: { href: "/refunds", label: "Read the refund policy" },
  },
  {
    q: "What if I'm running late?",
    a: "Message us on WhatsApp as soon as you can and we'll do our best to catch you up.",
  },
  {
    q: "Can I book a private event for my group?",
    a: "Yes. Fill in the private booking form and we'll take it from there.",
    link: { href: "/private-bookings", label: "Plan a private event" },
  },
  {
    q: "Do you do events for companies?",
    a: "Yes, through SerenArt Business.",
    link: { href: "/business", label: "See SerenArt Business" },
  },
];

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          FAQs
        </h1>
        <p className="mt-3 text-base leading-7 text-[#4a4a45]">
          Quick answers. Anything else, ask us on WhatsApp.
        </p>

        <div className="mt-10 space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white p-5 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#003118]">
                {f.q}
                <span className="text-[#f27a00] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#575750]">{f.a}</p>
              {f.link && (
                <Link
                  href={f.link.href}
                  className="mt-2 inline-block text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
                >
                  {f.link.label}
                </Link>
              )}
            </details>
          ))}
        </div>

        <div className="mt-10">
          <WhatsAppButton label="Questions? Chat on WhatsApp" />
        </div>
      </section>
    </main>
  );
}
