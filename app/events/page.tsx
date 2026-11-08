import { Suspense } from "react";
import type { Metadata } from "next";
import { EventsBrowser } from "@/components/events/EventsBrowser";
import { contentService } from "@/services/contentService";
import { copyGetter } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Upcoming events",
  description: "Grab a ticket, bring a friend, come as you are.",
};

export default async function EventsPage() {
  const t = copyGetter(await contentService.siteContent());
  return (
    <main className="min-h-screen bg-[#fffedd]">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-16">
        <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-6xl">
          {t("events.title")}
        </h1>
        <p className="mt-4 max-w-md text-lg leading-7 text-[#575750]">
          {t("events.sub")}
        </p>

        <div className="mt-10">
          <Suspense fallback={null}>
            <EventsBrowser />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
