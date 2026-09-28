import { Suspense } from "react";

import { getEvents } from "@/features/events/server";
import { FiltersShell } from "@/components/events/FiltersShell";

import { Blob } from "@/components/decorative/Blob";
import { AccentCircle } from "@/components/decorative/AccentCircle";
import { BrushShape } from "@/components/decorative/BrushShape";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const initial = await getEvents({
    search: sp?.q || undefined,
    limit: 12,
  });

  const ranges = [
    { k: "", label: "All experiences" },
    { k: "today", label: "Today" },
    { k: "week", label: "This week" },
    { k: "month", label: "This month" },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F7F3] text-[#171717]">
      {/* Decorative atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <Blob
          className="absolute -left-48 -top-20 h-[460px] w-[460px]"
          color="#DCEAE4"
          opacity={0.72}
        />

        <AccentCircle className="absolute -right-32 top-16 h-80 w-80" />

        <BrushShape
          className="absolute left-[42%] top-[470px] h-72 w-[500px] -translate-x-1/2"
          color="#FFE0C8"
          opacity={0.32}
        />
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pb-12 lg:pt-16">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_440px]">
            {/* Intro */}
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-[2px] w-9 bg-[#E66D0B]" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B65]">
                  Discover something different
                </span>
              </div>

              <h1 className="max-w-2xl text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#004130] sm:text-5xl lg:text-[4.25rem]">
                Find your next
                <span className="relative ml-2 inline-block">
                  experience.
                  <span className="absolute -bottom-1 left-1 right-0 h-2 -rotate-1 rounded-full bg-[#E66D0B]/25" />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#686860] sm:text-lg">
                From creative workshops to unforgettable gatherings, discover
                experiences worth stepping out for.
              </p>
            </div>

            {/* Small editorial statement */}
            <div className="hidden lg:block">
              <div className="relative rounded-[1.75rem] bg-[#004130] p-7 text-white shadow-[0_20px_50px_rgba(0,65,48,0.12)]">
                <div className="absolute right-5 top-5 h-12 w-12 rounded-full border-[7px] border-[#E66D0B]/70" />

                <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  What's happening
                </div>

                <p className="mt-4 max-w-xs text-xl font-medium leading-8 tracking-tight">
                  Make plans. Meet people. Create memories.
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
                  <span className="h-2 w-2 rounded-full bg-[#E66D0B]" />
                  Browse upcoming experiences
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-10 max-w-3xl sm:mt-12">
            <form action="/events">
              <label htmlFor="q" className="sr-only">
                Search experiences
              </label>

              <div className="group relative">
                <div className="pointer-events-none absolute -inset-1 rounded-[1.4rem] bg-[#004130]/5 opacity-0 blur transition-opacity group-focus-within:opacity-100" />

                <div className="relative flex items-center rounded-[1.25rem] border border-[#E1E0D9] bg-white p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.055)] transition-shadow group-focus-within:shadow-[0_15px_45px_rgba(0,65,48,0.10)]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[#004130]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="6.5" />
                      <path d="m16 16 4 4" strokeLinecap="round" />
                    </svg>
                  </div>

                  <input
                    id="q"
                    name="q"
                    defaultValue={sp?.q || ""}
                    placeholder="Search events, venues or cities"
                    className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] text-[#004130] outline-none placeholder:text-[#9B9B93]"
                  />

                  <button
                    type="submit"
                    className="hidden h-11 shrink-0 items-center rounded-[0.9rem] bg-[#004130] px-5 text-sm font-semibold text-white transition hover:bg-[#00543F] sm:inline-flex"
                  >
                    Search
                  </button>

                  <button
                    type="submit"
                    aria-label="Search"
                    className="mr-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#004130] text-white transition hover:bg-[#00543F] sm:hidden"
                  >
                    →
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#96968E]">
              When
            </span>

            {ranges.map((range) => {
              const url = new URLSearchParams();

              if (sp?.q) {
                url.set("q", sp.q);
              }

              if (range.k) {
                url.set("range", range.k);
              }

              const active = (sp?.range || "") === range.k;

              return (
                <a
                  key={range.k || "all"}
                  href={`/events?${url.toString()}`}
                  className={[
                    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-[#004130] text-white shadow-sm"
                      : "border border-[#E4E3DD] bg-white text-[#004130] hover:border-[#004130]/20 hover:bg-[#FDFDFC]",
                  ].join(" ")}
                >
                  {range.label}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Event discovery */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10 lg:pb-24">
        <div className="mb-7 flex items-end justify-between gap-5 border-b border-[#E5E4DE] pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#E66D0B]">
              Upcoming
            </div>

            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#004130] sm:text-3xl">
              Experiences to explore
            </h2>
          </div>

          <div className="hidden text-sm text-[#85857D] sm:block">
            {initial.items.length > 0
              ? `${initial.items.length} experiences`
              : "No experiences found"}
          </div>
        </div>

        {/* FiltersShell should render the actual event cards/grid */}
        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[1.5rem] bg-white"
                >
                  <div className="aspect-[4/3] animate-pulse bg-[#E9E8E2]" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#E9E8E2]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#E9E8E2]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#E9E8E2]" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <FiltersShell initialEvents={initial.items} />
        </Suspense>
      </section>
    </main>
  );
}
