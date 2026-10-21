import type { Metadata } from "next";
import Link from "next/link";
import { PhotoTile } from "@/components/ui/PhotoTile";

export const metadata: Metadata = {
  title: "Gallery | SerenArt",
  description: "Photos and short videos from past SerenArt events.",
};

const tiles = [
  { kind: "PHOTO" as const, label: "PAINTING NIGHT" },
  { kind: "PHOTO" as const, label: "KARAOKE" },
  { kind: "VIDEO" as const, label: "PICNIC DAY" },
  { kind: "PHOTO" as const, label: "PRIVATE PARTY" },
  { kind: "PHOTO" as const, label: "TEAM DAY" },
  { kind: "VIDEO" as const, label: "POTTERY" },
  { kind: "PHOTO" as const, label: "BEACH DAY" },
  { kind: "PHOTO" as const, label: "BRIDAL SHOWER" },
  { kind: "VIDEO" as const, label: "RNB NIGHT" },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Gallery
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4a4a45]">
          Photos and short videos from past events. Real people, real mess,
          really good times.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {tiles.map((t, i) => (
            <PhotoTile
              key={t.label}
              kind={t.kind}
              label={t.label}
              className={i % 5 === 0 ? "aspect-[4/5] sm:row-span-2 sm:aspect-auto sm:h-full" : "aspect-[4/5]"}
            />
          ))}
        </div>
        <div className="mt-14 rounded-[2rem] bg-[#003118] px-6 py-12 text-center sm:px-10">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Ready? Let's make a night of it.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/events"
              className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c00]"
            >
              See upcoming events
            </Link>
            <Link
              href="/private-bookings"
              className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Plan something with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
