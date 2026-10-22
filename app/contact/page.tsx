import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappUrl } from "@/lib/site-config";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  title: "Contact | SerenArt",
  description: "How to reach SerenArt — WhatsApp, email and Instagram.",
};

export default function ContactPage() {
  const wa = whatsappUrl();
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
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
              {site.whatsappDisplay}
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
            {site.email ? (
              <a
                href={`mailto:${site.email}`}
                className="mt-2 block font-semibold text-[#003118] hover:text-[#f27a00]"
              >
                {site.emailDisplay}
              </a>
            ) : (
              <div className="mt-2 font-semibold text-[#003118]">
                {site.emailDisplay}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
              Instagram
            </div>
            <div className="mt-2 font-semibold text-[#003118]">
              {site.instagramDisplay}
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#ecebd8] bg-[#fffdf0] p-6">
          <p className="text-sm leading-6 text-[#575750]">
            Planning something?{" "}
            <Link
              href="/private-bookings"
              className="font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
            >
              Send a private booking enquiry
            </Link>{" "}
            or{" "}
            <Link
              href="/business"
              className="font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
            >
              talk to SerenArt Business
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
