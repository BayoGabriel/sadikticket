import Link from "next/link";
import type { Metadata } from "next";
import { Img } from "@/components/ui/Img";
import {
  experienceCategories,
  type ExperienceCategory,
} from "@/lib/experiences";
import { contentService } from "@/services/contentService";

export const metadata: Metadata = {
  title: "Our Experiences | SerenArt",
  description:
    "Everything we do — creative activities, social experiences and outdoor experiences in Lagos and Benin City.",
};

const sectionTheme: Record<
  ExperienceCategory,
  { bg: string; heading: string; body: string; card: string }
> = {
  creative: {
    bg: "bg-[#f27a00]",
    heading: "text-[#003118]",
    body: "text-[#003118]/80",
    card: "bg-[#fffedd]",
  },
  social: {
    bg: "bg-[#e7efe9]",
    heading: "text-[#003118]",
    body: "text-[#4a4a45]",
    card: "bg-white",
  },
  outdoor: {
    bg: "bg-[#003118]",
    heading: "text-[#fffedd]",
    body: "text-[#fffedd]/75",
    card: "bg-[#0c4a2b]",
  },
};

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  // Admin-editable catalogue (DB-backed, static fallback inside the service).
  const { items: experiences, images: expImages } = await contentService.experiences();
  const cats = Object.entries(experienceCategories) as [
    ExperienceCategory,
    (typeof experienceCategories)[ExperienceCategory],
  ][];

  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-4 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Everything <span className="text-[#f27a00]">we do</span>
        </h1>
        <div className="mt-8 flex flex-wrap gap-2">
          {cats.map(([key, c]) => (
            <a
              key={key}
              href={`#${c.anchor}`}
              className="rounded-full border border-[#003118]/20 bg-white px-4 py-2 text-sm font-medium text-[#003118] transition hover:border-[#003118]/50"
            >
              {c.title}
            </a>
          ))}
        </div>
      </section>

      {/* Colour-blocked category sections */}
      {cats.map(([key, cat]) => {
        const theme = sectionTheme[key];
        const items = experiences.filter((e) => e.category === key);
        return (
          <section
            key={key}
            id={cat.anchor}
            className={`mt-10 scroll-mt-20 ${theme.bg}`}
          >
            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
              <h2
                className={`font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl ${theme.heading}`}
              >
                {cat.title}
              </h2>
              <p
                className={`mt-2 max-w-xl text-base leading-7 ${theme.body}`}
              >
                {cat.blurb}
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((exp) => (
                  <Link
                    key={exp.slug}
                    href={`/experiences/${exp.slug}`}
                    className={`group overflow-hidden rounded-3xl shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${theme.card} ${
                      exp.wide ? "sm:col-span-2 lg:col-span-4" : ""
                    }`}
                  >
                    <Img
                      image={expImages[exp.slug]}
                      rounded="rounded-none"
                      className="transition duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="p-5">
                      <h3 className="font-semibold text-[#003118]">
                        {exp.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-[#575750]">
                        {exp.oneLiner}
                      </p>
                      <span className="mt-3 inline-block text-sm font-semibold text-[#f27a00] underline underline-offset-4">
                        Find out more
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Bottom dual CTA */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-5 rounded-[2rem] bg-[#003118] p-8 sm:p-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Found one you like?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
              Book an experience for your own group — birthdays, hangouts,
              reunions, anything worth celebrating.
            </p>
            <Link
              href="/private-bookings"
              className="btn btn-orange mt-6"
            >
              Book Now
            </Link>
          </div>
          <div className="md:border-l md:border-white/15 md:pl-10">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Join our public events
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
              Grab a ticket to the next public experience in your city.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
