import { Suspense } from "react";

function SearchBar() {
  return (
    <form action="/events" className="relative w-full max-w-2xl">
      <label htmlFor="q" className="sr-only">
        Search events, venues or cities
      </label>
      <input
        id="q"
        name="q"
        placeholder="Search events, venues or cities..."
        className="w-full rounded-full border border-(--border) bg-white px-5 py-3 pr-12 text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--brand-primary) transition"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-(--brand-primary) text-white hover:bg-(--brand-primary-hover)"
      >
        🔍
      </button>
    </form>
  );
}

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-(--text-primary) tracking-tight">
            Discover experiences worth attending.
          </h1>
          <p className="mt-3 text-(--text-muted) max-w-prose">
            Find events happening around you, grab your ticket, and make plans
            worth remembering.
          </p>
          <div className="mt-6">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-(--surface-muted) h-48" />
            <div className="rounded-2xl bg-(--surface-muted) h-72" />
            <div className="rounded-2xl bg-(--surface-muted) h-72" />
            <div className="rounded-2xl bg-(--surface-muted) h-48" />
          </div>
        </div>
      </div>
    </section>
  );
}
