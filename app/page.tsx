import { FeaturedEvents } from "@/components/events/FeaturedEvents";
import { Hero } from "@/components/layout/Hero";
import { getEvents } from "@/features/events/server";
import { FiltersShell } from "@/components/events/FiltersShell";
import { Suspense } from "react";

export default async function Home() {
  const initial = await getEvents({ limit: 9 });
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedEvents />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-(--text-primary) text-xl font-semibold">
            Explore Events
          </h2>
        </div>
        <Suspense>
          <FiltersShell initialEvents={initial.items} />
        </Suspense>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl bg-white border border-(--border) p-8 text-center">
          <h3 className="text-(--text-primary) text-lg font-semibold">
            Can’t find what you’re looking for?
          </h3>
          <p className="text-(--text-muted) mt-1">Browse all upcoming events</p>
          <a
            href="/events"
            className="inline-flex items-center rounded-full bg-(--brand-primary) text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-(--brand-primary-hover) mt-4"
          >
            Browse all events
          </a>
        </div>
      </section>
    </main>
  );
}
