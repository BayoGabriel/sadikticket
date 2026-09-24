import { Suspense } from "react";
import { Blob } from "@/components/decorative/Blob";
import { AccentCircle } from "@/components/decorative/AccentCircle";
import { BrushShape } from "@/components/decorative/BrushShape";
import { DecorativePattern } from "@/components/decorative/DecorativePattern";

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
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#EAF3F0] to-transparent" />
      <Blob
        className="pointer-events-none absolute -top-24 -left-16 w-96 h-96"
        color="#E6EEEB"
        opacity={0.8}
      />
      <AccentCircle className="pointer-events-none absolute -right-24 -top-12 w-72 h-72" />
      <BrushShape
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-10 w-120 h-80"
        color="#FFE1CC"
        opacity={0.6}
      />
      <DecorativePattern className="pointer-events-none absolute -bottom-12 right-8 w-72 h-72" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-medium tracking-wide text-(--brand-primary)">
              Create · Sip · Connect
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-semibold text-(--text-primary) tracking-tight leading-tight">
              Find your next
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-(--brand-primary) to-(--brand-primary-hover)">
                creative experience
              </span>
            </h1>
            <p className="mt-4 text-(--text-muted) max-w-prose">
              Discover artistic, social events that feel warm, playful, and
              premium. Book your spot and make memories.
            </p>
            <div className="mt-6">
              <Suspense>
                <SearchBar />
              </Suspense>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-24 h-24 rounded-3xl bg-(--brand-accent)/20 blur-md" />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-(--surface-muted) h-48 shadow-sm" />
                <div className="rounded-3xl bg-(--surface-muted) h-72 shadow-sm rotate-1" />
                <div className="rounded-3xl bg-(--surface-muted) h-72 shadow-sm -rotate-1" />
                <div className="rounded-3xl bg-(--surface-muted) h-48 shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
