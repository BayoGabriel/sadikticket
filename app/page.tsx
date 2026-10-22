import Link from "next/link";
import type { Metadata } from "next";

import { getEvents } from "@/features/events/server";
import { EventCard } from "@/components/events/EventCard";
import { PhotoTile } from "@/components/ui/PhotoTile";

export const metadata: Metadata = {
  title: "SerenArt — Life's Too Short for Boring Plans",
  description:
    "Create art, vibe to your favourite playlists, meet your people and have a good time. Public events and private experiences in Lagos and Benin City.",
};

const vibeTags = [
  "Painting",
  "Clay",
  "Karaoke",
  "Picnics",
  "Trivia",
  "RnB nights",
  "Birthdays",
  "Team days",
];

const moods = [
  {
    title: "Creative Experiences",
    body: "Canvas Painting, Clay Painting, Gypsum Art..",
  },
  {
    title: "Social Experiences",
    body: "Karaoke, games, trivia, Mixers…",
  },
  {
    title: "Outdoor Experiences",
    body: "Picnics, beach, retreats, outdoor games…",
  },
];

const steps = [
  {
    n: "1",
    title: "Pick an event",
    body: "Find one you like in your city.",
  },
  {
    n: "2",
    title: "Grab your ticket",
    body: "Pay online, get your ticket by email.",
  },
  {
    n: "3",
    title: "Show up",
    body: "We've got the setup. You bring the good mood.",
  },
];

const galleryStrip = [
  { kind: "PHOTO" as const, label: "PAINTING NIGHT" },
  { kind: "PHOTO" as const, label: "KARAOKE" },
  { kind: "VIDEO" as const, label: "PICNIC DAY" },
  { kind: "PHOTO" as const, label: "PRIVATE PARTY" },
  { kind: "PHOTO" as const, label: "TEAM DAY" },
  { kind: "VIDEO" as const, label: "POTTERY" },
];

export default async function HomePage() {
  const upcoming = await getEvents({ limit: 4 });

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffedd] text-[#1a1a1a]">
      {/* 1. Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#003118] sm:text-6xl lg:text-7xl">
              Life’s Too Short for Boring Plans.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#4a4a45] sm:text-lg">
              Create art, vibe to your favourite playlists, meet your people and
              have a good time, with absolutely no pressure to be Picasso.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d56c00]"
              >
                View Upcoming Event
              </Link>
              <Link
                href="/private-bookings"
                className="inline-flex items-center rounded-full border border-[#003118]/25 bg-white px-6 py-3 text-sm font-semibold text-[#003118] transition hover:border-[#003118]/50"
              >
                Plan A Private Experience
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-[#6b6b6b]">
              {vibeTags.map((t, i) => (
                <span key={t} className="flex items-center gap-4">
                  {t}
                  {i < vibeTags.length - 1 && (
                    <span className="text-[#f27a00]">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PhotoTile
              label="CANVAS PAINTING NIGHT"
              className="col-span-2 aspect-[16/9]"
            />
            <PhotoTile label="KARAOKE" className="aspect-square" />
            <PhotoTile label="PICNIC DAY" className="aspect-square" />
          </div>
        </div>
      </section>

      {/* 2. Who we are */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-20">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-4xl">
              We’re SerenArt.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4a4a45]">
              We believe life should be about more than routines. It’s about
              trying something new, meeting people, expressing yourself and
              creating moments worth remembering.
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#4a4a45]">
              From creative workshops and social events to personalised
              celebrations and corporate experiences, we create spaces where
              people can connect, unwind and have a genuinely good time.
            </p>
            <Link
              href="/experiences"
              className="mt-7 inline-flex items-center rounded-full bg-[#003118] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#024a26]"
            >
              Explore Experiences
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PhotoTile label="THE TEAM" className="aspect-[4/5]" />
            <PhotoTile
              label="GUESTS LAUGHING"
              className="aspect-[4/5] translate-y-6"
            />
          </div>
        </div>
      </section>

      {/* 3. Upcoming events */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-5">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-4xl">
            Upcoming Events
          </h2>
          <Link
            href="/events"
            className="shrink-0 text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            See all events
          </Link>
        </div>
        {upcoming.items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.items.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center">
            <h3 className="font-semibold text-[#003118]">
              Nothing booked yet — new events are on the way.
            </h3>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center rounded-full bg-[#f27a00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#d56c00]"
            >
              See all events
            </Link>
          </div>
        )}
      </section>

      {/* 4. Explore experiences */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-4xl">
            What are you in the mood for?
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {moods.map((m) => (
              <div
                key={m.title}
                className="rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-[#003118]">
                  {m.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#575750]">{m.body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/experiences"
            className="mt-8 inline-flex items-center rounded-full border border-[#003118]/25 bg-white px-6 py-3 text-sm font-semibold text-[#003118] transition hover:border-[#003118]/50"
          >
            See everything we do
          </Link>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-4xl">
          Easy, we promise
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f27a00] text-base font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#003118]">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-[#575750]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Private bookings + business */}
      <section className="bg-[#003118]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Got something to celebrate? Make It a Whole Vibe.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-8">
              <h3 className="text-xl font-semibold text-[#003118]">
                Private Bookings.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#575750]">
                Birthday, bridal shower, Friendship hangout. Tell us the plan
                and we’ll make it happen.
              </p>
              <Link
                href="/private-bookings"
                className="mt-6 inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c00]"
              >
                Plan my party
              </Link>
            </div>
            <div className="rounded-3xl bg-white p-8">
              <h3 className="text-xl font-semibold text-[#003118]">
                SerenArt Business.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#575750]">
                Team bonding people actually want to show up for. From creative
                team sessions and staff celebrations to retreats and brand
                experiences, we help companies bring people together in ways
                they’ll actually enjoy.
              </p>
              <Link
                href="/business"
                className="mt-6 inline-flex items-center rounded-full bg-[#003118] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#024a26]"
              >
                Talk to SerenArt Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Proof */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-5">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-4xl">
            See the fun we’ve had
          </h2>
          <Link
            href="/gallery"
            className="shrink-0 text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            See the gallery
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {galleryStrip.map((g) => (
            <PhotoTile
              key={g.label}
              kind={g.kind}
              label={g.label}
              className="aspect-square"
            />
          ))}
        </div>

        <div className="mt-14">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a8a7d]">
            Brands we’ve worked with
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-16 items-center justify-center rounded-2xl bg-white text-xs font-semibold text-[#8a8a7d] shadow-sm"
              >
                Client logo
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
            Don’t take our word for it
          </h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              "[A real review from a guest goes here, in their own words.]",
              "[A real review from a guest goes here, in their own words.]",
              "[A real review from a client goes here, in their own words.]",
            ].map((quote, i) => (
              <figure key={i} className="rounded-3xl bg-white p-7 shadow-sm">
                <blockquote className="text-sm leading-6 text-[#575750]">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#8a8a7d]">
                  {i === 2 ? "[Name, company]" : "[First name] · [Event]"}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Last push */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#f27a00] px-6 py-14 text-center sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -right-12 h-60 w-60 rotate-12 rounded-[40%] border-[30px] border-white/10" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Ready? Let’s make a night of it.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#003118] transition hover:bg-[#fffdf0]"
              >
                See upcoming events
              </Link>
              <Link
                href="/private-bookings"
                className="inline-flex items-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Plan something with us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
