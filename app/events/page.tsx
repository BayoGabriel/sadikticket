import { Suspense } from "react";
import { getEvents } from "@/features/events/server";
import { FiltersShell } from "@/components/events/FiltersShell";
import { Blob } from "@/components/decorative/Blob";
import { AccentCircle } from "@/components/decorative/AccentCircle";
import { BrushShape } from "@/components/decorative/BrushShape";

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const initial = await getEvents({ search: sp?.q || undefined, limit: 12 });
  return (
    <main className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#EAF3F0] to-transparent" />
      <Blob className="pointer-events-none absolute -top-24 -left-16 w-96 h-96" color="#E6EEEB" opacity={0.7} />
      <AccentCircle className="pointer-events-none absolute -right-24 top-20 w-64 h-64" />
      <BrushShape className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-8 w-120 h-80" color="#FFE1CC" opacity={0.5} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-(--text-primary)">Discover experiences</h1>
          <p className="mt-2 text-(--text-muted)">Find something you'll love. Browse upcoming creative events.</p>
          <form action="/events" className="mt-6 max-w-xl">
            <label htmlFor="q" className="sr-only">Search events</label>
            <div className="relative">
              <input id="q" name="q" defaultValue={sp?.q || ""} placeholder="Search by event, venue or city" className="w-full rounded-full border border-(--border) bg-white px-5 py-3 pr-12 text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--brand-primary) transition" />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-(--brand-primary) text-white hover:bg-(--brand-primary-hover)">🔍</button>
            </div>
          </form>
        </header>
        <Suspense>
          <FiltersShell initialEvents={initial.items} />
        </Suspense>
      </section>
    </main>
  );
}
