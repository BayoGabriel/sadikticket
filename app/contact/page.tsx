import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, whatsappUrl } from "@/lib/site-config";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact | SerenArt",
  description: "How to reach SerenArt — WhatsApp, email and Instagram.",
};

export default function ContactPage() {
  const wa = whatsappUrl();
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Say hi
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4a4a45]">
          Questions about an event, a private booking or working with us? We’re
          easiest to reach on WhatsApp.
        </p>

        <div className="mt-10 space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
              WhatsApp
            </div>
            <div className="mt-2 font-semibold text-[#003118]">
              {siteConfig.whatsappDisplay}
            </div>
            {wa && (
              <div className="mt-4">
                <WhatsAppButton label="Chat on WhatsApp" />
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
              Email
            </div>
            {siteConfig.email ? (
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-2 block font-semibold text-[#003118] hover:text-[#f27a00]"
              >
                {siteConfig.emailDisplay}
              </a>
            ) : (
              <div className="mt-2 font-semibold text-[#003118]">
                {siteConfig.emailDisplay}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
              Instagram
            </div>
            <div className="mt-2 font-semibold text-[#003118]">
              {siteConfig.instagramDisplay}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
              Where we are
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {siteConfig.cities.map((c) => (
                <Link
                  key={c}
                  href={`/${c.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-full bg-[#e7efe9] px-4 py-2 text-sm font-semibold text-[#003118] hover:bg-[#b9d6c4]"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
            Or drop us a message
          </h2>
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
