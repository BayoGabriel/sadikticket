import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { experiences } from "@/lib/experiences";
import { Img } from "@/components/ui/Img";
import { EventCard } from "@/components/events/EventCard";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { listPublicEvents } from "@/services/eventDiscoveryService";
import { contentService } from "@/services/contentService";

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { items } = await contentService.experiences();
  const exp = items.find((e) => e.slug === slug);
  if (!exp) return { title: "Experience" };
  return {
    title: `${exp.name} | SerenArt`,
    description: exp.oneLiner,
  };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items, images: expImages } = await contentService.experiences();
  const exp = items.find((e) => e.slug === slug);
  if (!exp) return notFound();

  // Upcoming public events of this type — matched on eventType or tags.
  const related = await listPublicEvents({ limit: 12 });
  const relatedEvents = related.items.filter((ev) =>
    exp.eventTags.includes(ev.eventType ?? "") ||
    ev.tags?.some((t) => exp.eventTags.includes(t)),
  ).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        <Link
          href="/experiences"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#6B6B65] transition-colors hover:text-[#003118]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Everything we do
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:px-10">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#003118] sm:text-5xl">
            {exp.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#4a4a45] sm:text-lg">
            {exp.oneLiner}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/private-bookings" className="btn btn-orange">
              Book it for your group
            </Link>
            <WhatsAppButton
              label="Questions? Chat on WhatsApp"
              message={`Hi SerenArt! I'd like to know more about ${exp.name}.`}
            />
          </div>
        </div>
        <Img image={expImages[exp.slug]} />
      </section>

      {/* What it is / what to expect / who it suits / add-ons */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-2 lg:px-10">
          <div>
            {exp.whatItIs.length > 0 && (
              <>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
                  What it is
                </h2>
                <div className="mt-4 space-y-3 text-base leading-7 text-[#4a4a45]">
                  {exp.whatItIs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </>
            )}

            {exp.whatToExpect.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
                  What to expect on the day
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {exp.whatToExpect.map((x, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-6 text-[#4a4a45]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f27a00]" />
                      {x}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            {exp.whoItSuits.length > 0 && (
              <>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
                  Who it suits
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.whoItSuits.map((w) => (
                    <span
                      key={w}
                      className="rounded-full border border-[#e0dfcf] bg-white px-4 py-2 text-sm font-medium text-[#003118]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </>
            )}

            {exp.addons.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118]">
                  Add-ons you can ask for
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {exp.addons.map((a, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-6 text-[#4a4a45]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0c4a2b]" />
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming public events of this type */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
          Upcoming {exp.name.toLowerCase()} events
        </h2>
        {relatedEvents.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[#575750]">
            Nothing public on the calendar right now — but you can{" "}
            <Link
              href="/private-bookings"
              className="font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
            >
              book it privately
            </Link>{" "}
            anytime.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] bg-[#003118] p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Want {exp.name.toLowerCase()} for your own group?
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/private-bookings" className="btn btn-orange">
              Plan it with us
            </Link>
            <WhatsAppButton
              label="Chat on WhatsApp"
              message={`Hi SerenArt! I'd like to book ${exp.name} for my group.`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
