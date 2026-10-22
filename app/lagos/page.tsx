import { Suspense } from "react";
import type { Metadata } from "next";
import { EventsBrowser } from "@/components/events/EventsBrowser";

export const metadata: Metadata = {
  title: "Events in Lagos",
  description:
    "Grab a ticket, bring a friend, come as you are. SerenArt events in Lagos.",
};

export default function LagosPage() {
  return (
    <main className="min-h-screen bg-[#fffedd]">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-16">
        <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-6xl">
          Upcoming <span className="text-[#f27a00]">events</span> in Lagos
        </h1>
        <p className="mt-4 max-w-md text-lg leading-7 text-[#575750]">
          Grab a ticket, bring a friend, come as you are.
        </p>
        <div className="mt-10">
          <Suspense fallback={null}>
            <EventsBrowser lockedCity="Lagos" />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
