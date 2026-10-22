import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery | SerenArt",
  description: "Photos and short videos from past SerenArt events.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Gallery
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4a4a45]">
          Photos and short videos from past events. Real people, real mess,
          really good times.
        </p>

        <GalleryGrid />

        <div className="mt-14 rounded-[2rem] bg-[#003118] px-6 py-12 text-center sm:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Ready? Let’s make a night of it.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/events" className="btn btn-orange">
              See upcoming events
            </Link>
            <Link
              href="/private-bookings"
              className="inline-flex min-h-11 items-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Plan something with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
