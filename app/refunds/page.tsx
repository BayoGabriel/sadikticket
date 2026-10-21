import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  title: "Refunds and Cancellations | SerenArt",
  description:
    "Our refunds and cancellations policy, written in plain words.",
};

export default function RefundsPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Refunds and Cancellations
        </h1>
        <p className="mt-3 text-base leading-7 text-[#4a4a45]">
          The small print, in plain words.
        </p>

        <div className="mt-10 space-y-6 text-sm leading-7 text-[#4a4a45]">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#003118]">
              If you can’t make it
            </h2>
            <p className="mt-2">
              Tell us as early as you can — the earlier we know, the more we can
              do. Message us on WhatsApp or reply to your ticket email and we’ll
              take it from there.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#003118]">
              If we cancel or move an event
            </h2>
            <p className="mt-2">
              If we cancel or reschedule an event, we’ll email every ticket
              holder with the options — a refund or a swap to the new date.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#003118]">
              Private bookings
            </h2>
            <p className="mt-2">
              Private events have their own arrangement, agreed when we
              confirm your booking. If something changes, talk to us early.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#003118]">
              How to ask
            </h2>
            <p className="mt-2">
              The fastest way is WhatsApp. You can also use the{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
              >
                contact page
              </Link>
              .
            </p>
            <div className="mt-4">
              <WhatsAppButton />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
