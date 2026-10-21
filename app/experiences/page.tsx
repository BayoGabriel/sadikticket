import Link from "next/link";
import type { Metadata } from "next";
import { PhotoTile } from "@/components/ui/PhotoTile";

export const metadata: Metadata = {
  title: "Our Experiences | SerenArt",
  description:
    "Everything we do — creative activities, social experiences and outdoor experiences in Lagos and Benin City.",
};

const categories = [
  {
    title: "Creative Activities",
    blurb: "Get creative. Get messy. Make something yours.",
    items: [
      {
        name: "Canvas painting",
        desc: "Follow along with a host and leave with your own painting.",
      },
      { name: "Clay Hand Building", desc: "Get your hands in the clay." },
      {
        name: "Gypsum art",
        desc: "Create your own home decor piece from scratch.",
      },
      {
        name: "Custom art experience",
        desc: "Tell us the theme and we'll build it.",
      },
    ],
  },
  {
    title: "Social Experience",
    blurb: "Good music, loud laughing, and people you haven't met yet.",
    items: [
      {
        name: "Karaoke",
        desc: "You don't have to sing well, you just have to sing.",
      },
      {
        name: "Games and trivia",
        desc: "Teams, bragging rights, small prizes.",
      },
      { name: "RnB nights", desc: "Slow jams, good people, easy vibes." },
      { name: "Themed socials", desc: "Pick a theme, dress for it." },
      { name: "Social mixers", desc: "Come alone, leave with new people." },
    ],
  },
  {
    title: "Outdoor Experience",
    blurb: "Take the fun outside.",
    items: [
      { name: "Park picnics", desc: "Blankets, snacks, good company." },
      { name: "Beach days", desc: "Sand, games and a long afternoon with no plans." },
      { name: "Retreats", desc: "A full reset, away from the routine." },
      { name: "Outdoor socials", desc: "Open air, games and new faces." },
    ],
  },
];

export default function ExperiencesPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Everything we do
        </h1>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a
              key={c.title}
              href={`#${c.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full border border-[#e0dfcf] bg-white px-4 py-2 text-sm font-medium text-[#003118] transition hover:border-[#003118]/30"
            >
              {c.title}
            </a>
          ))}
        </div>

        {categories.map((cat) => (
          <section
            key={cat.title}
            id={cat.title.toLowerCase().replace(/\s+/g, "-")}
            className="mt-14 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              {cat.title}
            </h2>
            <p className="mt-2 max-w-xl text-base leading-7 text-[#4a4a45]">
              {cat.blurb}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cat.items.map((item) => (
                <div
                  key={item.name}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  <PhotoTile label={item.name} className="aspect-[4/3] rounded-none" />
                  <div className="p-5">
                    <h3 className="font-semibold text-[#003118]">{item.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#575750]">
                      {item.desc}
                    </p>
                    <Link
                      href="/private-bookings"
                      className="mt-3 inline-block text-sm font-semibold text-[#f27a00] underline underline-offset-4 hover:text-[#d56c00]"
                    >
                      Find out more
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-16 grid gap-5 rounded-[2rem] bg-[#003118] p-8 sm:p-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Found one you like?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
              Book an experience for your own group — birthdays, hangouts,
              reunions, anything worth celebrating.
            </p>
            <Link
              href="/private-bookings"
              className="mt-6 inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c00]"
            >
              Book Now
            </Link>
          </div>
          <div className="md:border-l md:border-white/15 md:pl-10">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Join our public events
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
              Grab a ticket to the next public experience in your city.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See Upcoming Events
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
