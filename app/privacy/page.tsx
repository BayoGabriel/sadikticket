import type { Metadata } from "next";
import { contentService } from "@/services/contentService";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "Privacy Policy | SerenArt",
  description: "How SerenArt handles your information.",
};

const LAST_UPDATED = "27 October 2026";

const intro =
  "SerenArt respects your privacy. This Privacy Policy explains how we collect, use, store and protect personal information when you visit our website, book an experience, purchase a ticket, shop through SerenFinds or contact us.";

const sections: { title: string; body?: string[]; bullets?: string[] }[] = [
  {
    title: "1. Information We Collect",
    body: ["Depending on how you interact with us, we may collect:"],
    bullets: [
      "Contact information: name, email address and phone number.",
      "Booking information: event tickets, private bookings, corporate enquiries and order details.",
      "Payment information: transaction references and payment status. Payments may be processed by third-party payment providers.",
      "Newsletter information: your email address and communication preferences.",
      "Technical information: information such as browser type, device details and website usage data, where collected through cookies or similar technologies.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: ["We use your information to:"],
    bullets: [
      "Process ticket purchases, product orders and bookings.",
      "Communicate event details, booking updates and customer support responses.",
      "Send newsletters, upcoming event announcements and promotional offers where permitted.",
      "Improve our website, products and customer experience.",
      "Prevent fraud, maintain security and comply with legal obligations.",
    ],
  },
  {
    title: "3. Marketing Communications",
    body: [
      "If you subscribe to our newsletter or agree to receive marketing messages, we may contact you about upcoming experiences, products and offers. You can unsubscribe from marketing emails at any time using the unsubscribe link or by contacting us.",
    ],
  },
  {
    title: "4. Sharing Your Information",
    body: [
      "We do not sell your personal information. We may share relevant information with trusted service providers who help us operate our website, process payments, manage bookings, deliver orders or send communications.",
      "We may also disclose information when required by law or when necessary to protect our rights, customers or services.",
    ],
  },
  {
    title: "5. Cookies and Website Analytics",
    body: [
      "Our website may use cookies and similar technologies to support website functionality, understand visitor behaviour and improve performance. Where required, we will request consent for non-essential cookies. You can also manage cookies through your browser settings.",
    ],
  },
  {
    title: "6. Data Storage and Security",
    body: [
      "We take reasonable steps to protect personal information against unauthorised access, loss, misuse or disclosure. However, no online system can guarantee absolute security.",
      "We retain information only for as long as reasonably necessary for the purposes described in this policy or as required by law.",
    ],
  },
  {
    title: "7. Your Privacy Rights",
    body: [
      "Subject to applicable law, you may have the right to request access to your personal information, correct inaccurate information, request deletion, object to certain processing or withdraw consent where processing relies on consent.",
      "To exercise these rights, contact us using the details published on our website.",
    ],
  },
  {
    title: "8. Third-Party Services",
    body: [
      "Our website may link to third-party platforms, including ticketing, payment and social media services. Their privacy practices are governed by their own policies, and we encourage you to review them.",
    ],
  },
  {
    title: "9. Children’s Privacy",
    body: [
      "Our website and services are not intended to collect children’s personal information unnecessarily. Where information about a child is required for a legitimate service, we will handle it in accordance with applicable law.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    body: [
      "We may update this Privacy Policy to reflect changes in our practices or legal requirements. Updates will be published on this page with a revised date.",
    ],
  },
  {
    title: "11. Contact Us",
    body: [
      "For privacy-related questions or requests, contact SerenArt through the contact details published on our website.",
    ],
  },
];

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const custom = await contentService.page("privacy");
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Privacy Policy
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
