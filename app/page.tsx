import Link from "next/link";
import type { Metadata } from "next";

import { getEvents } from "@/features/events/server";
import { reviewService } from "@/services/reviewService";
import { EventCard } from "@/components/events/EventCard";
import { Img } from "@/components/ui/Img";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Squiggle, Star } from "@/components/decorative/Doodles";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "SerenArt — Life's Too Short for Boring Plans",
  description:
    "Create art, vibe to your favourite playlists, meet your people and have a good time, with absolutely no pressure to be Picasso.",
};

const tickerItems = [
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
    image: images.moods.creative,
    cls: "bg-[#f27a00] text-[#003118]",
  },
  {
    title: "Social Experiences",
    body: "Karaoke, games, trivia, Mixers…",
    image: images.moods.social,
    cls: "bg-[#e7efe9] text-[#003118]",
  },
  {
    title: "Outdoor Experiences",
    body: "Picnics, beach, retreats, outdoor games…",
    image: images.moods.outdoor,
    cls: "bg-[#003118] text-[#fffedd]",
  },
];

const steps = [
  { n: 1, title: "Pick an event", body: "Find one you like in your city." },
  {
    n: 2,
    title: "Grab your ticket",
    body: "Pay online, get your ticket by email.",
  },
  {
    n: 3,
    title: "Show up",
    body: "We've got the setup. You bring the good mood.",
  },
];

const proofSlots = [
  images.gallery.g1,
  images.gallery.g2,
  images.gallery.g3,
  images.gallery.g4,
  images.gallery.g5,
  images.gallery.g6,
];

export default async function HomePage() {
  const [{ items: events }, reviews] = await Promise.all([
    getEvents({ limit: 4 }),
    reviewService.listApproved(3),
  ]);

  return (
    <main className="bg-[#fffedd]">
      {/* 1 ─ Hero + ticker */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pt-20">
        <div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-[#003118] sm:text-6xl lg:text-7xl">
            Life&rsquo;s Too Short for{" "}
            <span className="relative inline-block text-[#f27a00]">
              Boring&nbsp;Plans.
              <Squiggle className="absolute -bottom-2 left-0 h-3 w-full text-[#f27a00]" />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#575750]">
            Create art, vibe to your favourite playlists, meet your people and
            have a good time, with absolutely no pressure to be Picasso.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-orange">
              View Upcoming Event
            </Link>
            <Link href="/private-bookings" className="btn btn-outline">
              Plan A Private Experience
            </Link>
          </div>
        </div>

        {/* overlapping photo collage, slightly rotated */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Star className="absolute -top-4 right-6 h-8 w-8 rotate-12 text-[#f27a00]" />
          <div className="grid grid-cols-3 items-center gap-3">
            <Img
              image={images.hero.canvas}
              priority
              className="-rotate-3 shadow-md"
            />
            <Img
              image={images.hero.karaoke}
              priority
              className="mt-10 rotate-2 shadow-md"
            />
            <Img
              image={images.hero.picnic}
              priority
              className="-mb-8 rotate-4 shadow-md"
            />
          </div>
        </div>
      </section>
      <Marquee items={tickerItems} />

      {/* 2 ─ We're SerenArt */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
            We&rsquo;re SerenArt.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#575750]">
            We believe life should be about more than routines. It&rsquo;s about
            trying something new, meeting people, expressing yourself and
            creating moments worth remembering.
          </p>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#575750]">
            From creative workshops and social events to personalised
            celebrations and corporate experiences, we create spaces where
            people can connect, unwind and have a genuinely good time.
          </p>
          <Link href="/experiences" className="btn btn-green mt-7">
            Explore Experiences
          </Link>
        </Reveal>
        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          <Img image={images.whoWeAre.main} className="rotate-2 shadow-md" />
          <Img
            image={images.whoWeAre.offset}
            className="mt-12 -rotate-2 shadow-md"
          />
        </div>
      </section>

      {/* 3 ─ Upcoming events */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-sm font-bold text-[#003118] underline decoration-[#f27a00] decoration-2 underline-offset-4 hover:text-[#f27a00]"
            >
              See all events
            </Link>
          </div>
          {events.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-3xl bg-white p-8 text-sm text-[#575750]">
              Nothing booked yet — new events land here automatically when
              they&rsquo;re published.
            </p>
          )}
        </div>
      </section>

      {/* 4 ─ What are you in the mood for? */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
            What are you in the mood for?
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {moods.map((m, i) => (
            <Reveal key={m.title} delay={i * 80}>
              <div className={`overflow-hidden rounded-3xl ${m.cls}`}>
                <Img
                  image={m.image}
                  rounded="rounded-none"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 opacity-80">{m.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/experiences" className="btn btn-outline">
            See everything we do
          </Link>
        </div>
      </section>

      {/* 5 ─ Easy, we promise */}
      <section className="bg-[#003118] text-[#fffedd]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Easy, we promise
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f27a00] font-display text-xl font-bold text-[#003118]">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-1.5 max-w-xs text-sm leading-6 text-[#fffedd]/75">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 ─ Got something to celebrate? */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
          Got something to celebrate? Make It a{" "}
          <span className="text-[#f27a00]">Whole Vibe.</span>
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-[#fdd3a2]">
            <Img
              image={images.celebrate.private}
              rounded="rounded-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="p-8">
              <h3 className="font-display text-2xl font-semibold text-[#003118]">
                Private Bookings.
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#003118]/80">
                Birthday, bridal shower, Friendship hangout. Tell us the plan
                and we&rsquo;ll make it happen.
              </p>
              <Link href="/private-bookings" className="btn btn-orange mt-5">
                Plan my party
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-[#003118]">
            <Img
              image={images.celebrate.business}
              rounded="rounded-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="p-8">
              <h3 className="font-display text-2xl font-semibold text-[#fffedd]">
                SerenArt Business.
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#f27a00]">
                Team bonding people actually want to show up for.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#fffedd]/75">
                From creative team sessions and staff celebrations to retreats
                and brand experiences, we help companies bring people together
                in ways they&rsquo;ll actually enjoy.
              </p>
              <Link href="/business" className="btn btn-orange mt-5">
                Talk to SerenArt Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7 ─ Proof */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
              See the fun we&rsquo;ve had
            </h2>
            <Link
              href="/gallery"
              className="text-sm font-bold text-[#003118] underline decoration-[#f27a00] decoration-2 underline-offset-4 hover:text-[#f27a00]"
            >
              See the gallery
            </Link>
          </div>
          <div className="mt-8 columns-2 gap-4 sm:columns-3">
            {proofSlots.map((img, i) => (
              <Img
                key={i}
                image={img}
                className="mb-4 break-inside-avoid"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            ))}
          </div>

          <h3 className="mt-14 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#003118]/60">
            Brands we&rsquo;ve worked with
          </h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {Object.values(images.logos).map((logo, i) =>
              logo.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 w-auto opacity-70 grayscale"
                />
              ) : (
                <span
                  key={i}
                  className="font-display text-sm font-semibold text-[#003118]/40"
                >
                  Client logo
                </span>
              ),
            )}
          </div>

          {reviews.length > 0 && (
            <>
              <h3 className="mt-14 font-display text-3xl font-semibold tracking-[-0.03em] text-[#003118]">
                Don&rsquo;t take our word for it
              </h3>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {reviews.map((r) => (
                  <figure
                    key={r.id}
                    className="rounded-3xl bg-white p-7 shadow-sm"
                  >
                    <blockquote className="text-sm leading-7 text-[#575750]">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="mt-4 text-xs font-bold text-[#003118]">
                      {r.name}
                      {r.context ? ` · ${r.context}` : ""}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 8 ─ Last push */}
      <section className="bg-[#f27a00]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
            Ready? Let&rsquo;s make a night of it.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-green">
              See upcoming events
            </Link>
            <Link href="/private-bookings" className="btn btn-outline">
              Plan something with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
