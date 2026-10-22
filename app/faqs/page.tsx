import type { Metadata } from "next";
import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { contentService } from "@/services/contentService";

export const metadata: Metadata = {
  title: "FAQs | SerenArt",
  description: "Quick answers about SerenArt events, tickets and bookings.",
};

// FAQ extra links matched by topic, not row id — works whether the
// questions come from the seed data or the admin-edited list.
function extraLinkFor(q: string, topics: string[]): { href: string; label: string } | null {
  const hay = `${q} ${topics.join(" ")}`.toLowerCase();
  if (/refund/.test(hay)) return { href: "/refunds", label: "Read the refund policy" };
  if (/private/.test(hay)) return { href: "/private-bookings", label: "Plan a private event" };
  if (/corporate|compan/.test(hay)) return { href: "/business", label: "See SerenArt Business" };
  return null;
}

export const dynamic = "force-dynamic";

export default async function FAQsPage() {
  const faqs = await contentService.faqs();
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          FAQs
        </h1>
        <p className="mt-3 text-base leading-7 text-[#4a4a45]">
          Quick answers. Anything else, ask us on WhatsApp.
        </p>

        <Accordion
          className="mt-10"
          items={faqs.map((f) => {
            const link = extraLinkFor(f.q, f.topics);
            return {
              title: f.q,
              body: (
                <>
                  {f.a}
                  {link && (
                    <>
                      {" "}
                      <Link
                        href={link.href}
                        className="font-semibold text-[#003118] underline decoration-[#f27a00] underline-offset-4 hover:text-[#f27a00]"
                      >
                        {link.label}
                      </Link>
                    </>
                  )}
                </>
              ),
            };
          })}
        />

        <div className="mt-10">
          <WhatsAppButton label="Questions? Chat on WhatsApp" />
        </div>
      </section>
    </main>
  );
}
