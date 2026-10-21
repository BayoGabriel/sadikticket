import type { Metadata } from "next";
import Link from "next/link";
import { PhotoTile } from "@/components/ui/PhotoTile";

export const metadata: Metadata = {
  title: "About | SerenArt",
  description:
    "We believe life should be about more than routines. Here's who we are.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:px-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
            We’re SerenArt.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#4a4a45] sm:text-lg">
            We believe life should be about more than routines. It’s about
            trying something new, meeting people, expressing yourself and
            creating moments worth remembering.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#4a4a45]">
            From creative workshops and social events to personalised
            celebrations and corporate experiences, we create spaces where
            people can connect, unwind and have a genuinely good time — in
            Lagos, Benin City, and wherever the vibe takes us next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/experiences"
              className="inline-flex items-center rounded-full bg-[#003118] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#024a26]"
            >
              Explore Experiences
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center rounded-full border border-[#003118]/25 bg-white px-6 py-3 text-sm font-semibold text-[#003118] transition hover:border-[#003118]/50"
            >
              See upcoming events
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PhotoTile label="THE TEAM" className="aspect-[4/5]" />
          <PhotoTile
            label="GUESTS LAUGHING"
            className="aspect-[4/5] translate-y-6"
          />
        </div>
      </section>
    </main>
  );
}
