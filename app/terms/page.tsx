import type { Metadata } from "next";
import { contentService } from "@/services/contentService";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "Terms & Conditions | SerenArt",
  description: "The terms for using the SerenArt website and buying tickets.",
};

const LAST_UPDATED = "27 October 2026";

const intro =
  "Welcome to SerenArt. By accessing our website, purchasing tickets, booking an experience or shopping with us, you agree to these Terms & Conditions.";

const sections: { title: string; body?: string[]; bullets?: string[] }[] = [
  {
    title: "1. About SerenArt",
    body: [
      "SerenArt provides creative experiences, public events, private bookings, corporate experiences and creative products through SerenFinds.",
    ],
  },
  {
    title: "2. Tickets and Event Bookings",
    bullets: [
      "All ticket purchases are subject to availability and the details provided for each event.",
      "Customers are responsible for providing accurate booking information.",
      "Tickets are valid for the event, date and ticket category purchased.",
      "Ticket transfers, cancellations and refunds are subject to the policy stated for the specific event or booking.",
      "Any event-specific rules will be communicated before or during the booking process.",
    ],
  },
  {
    title: "3. Private and Corporate Bookings",
    bullets: [
      "Private and corporate bookings may require a deposit or full payment, as stated in the booking agreement or invoice.",
      "The scope of services, date, venue, pricing and payment terms will be agreed upon before the booking is confirmed.",
      "Changes, cancellations and rescheduling requests must be communicated to SerenArt and are subject to the agreed booking terms.",
    ],
  },
  {
    title: "4. SerenFinds Purchases",
    bullets: [
      "Product descriptions, prices and availability are displayed on the relevant product pages.",
      "Orders are subject to confirmation and product availability.",
      "Delivery or collection arrangements, fees and estimated timelines will be communicated during checkout or ordering.",
      "Any applicable return, exchange or refund conditions will be provided before purchase.",
    ],
  },
  {
    title: "5. Event Participation",
    body: [
      "Customers are expected to behave respectfully towards other guests, staff, venues and property. SerenArt reserves the right to address disruptive or unsafe behaviour in accordance with applicable law and event policies.",
      "Guests participate in creative activities at their own discretion and should follow any relevant safety instructions.",
    ],
  },
  {
    title: "6. Photography and Video",
    body: [
      "SerenArt may photograph or record its experiences for promotional purposes. Where identifiable individuals are featured, we will seek consent where required by applicable law. Guests who do not wish to appear in promotional content should notify the team.",
    ],
  },
  {
    title: "7. Intellectual Property",
    body: [
      "Website content, branding, logos, original designs, photographs and other materials belonging to SerenArt may not be reproduced, distributed or used commercially without prior permission.",
    ],
  },
  {
    title: "8. Website Use",
    body: [
      "You agree not to misuse our website, interfere with its operation, submit fraudulent orders or use our services for unlawful purposes.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    body: [
      "To the extent permitted by applicable law, SerenArt is not responsible for losses arising from circumstances beyond its reasonable control. Nothing in these terms excludes liability that cannot legally be excluded.",
    ],
  },
  {
    title: "10. Changes to These Terms",
    body: [
      "We may update these Terms & Conditions when necessary. The latest version will be published on this page.",
    ],
  },
  {
    title: "11. Contact Us",
    body: [
      "For questions about these terms, bookings or purchases, contact SerenArt through the contact details published on our website.",
    ],
  },
];

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  // Admin-edited copy wins when saved in Settings → Policies & pages.
  const custom = await contentService.page("terms");
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Terms &amp; Conditions
        </h1>
        {custom ? (
          <>
            <div
              className="rich-page mt-10 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(custom.content) }}
            />
            {custom.lastUpdatedAt && (
              <p className="mt-4 text-xs text-[#8a8a7d]">
                Last updated {new Date(custom.lastUpdatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-3 text-xs text-[#8a8a7d]">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-6 text-base leading-7 text-[#4a4a45]">{intro}</p>
            <div className="mt-10 space-y-6 text-sm leading-7 text-[#4a4a45]">
              {sections.map((s) => (
                <section
                  key={s.title}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-[#003118]">
                    {s.title}
                  </h2>
                  {s.body?.map((p, i) => (
                    <p key={i} className="mt-2">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="mt-2 list-disc space-y-1.5 pl-5">
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
