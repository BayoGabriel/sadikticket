import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { getEventBySlug, listTicketTypesBySlug } from "@/features/checkout/api";
import { TicketPicker } from "@/components/events/TicketPicker";
import { Accordion } from "@/components/ui/Accordion";
import { Img } from "@/components/ui/Img";
import { contentService } from "@/services/contentService";
import { settingsService } from "@/services/settingsService";
import { siteConfig, whatsappUrl } from "@/lib/site-config";
import { images } from "@/lib/images";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { eventStatusLabel } from "@/lib/eventStatus";

function mapsUrl(parts: (string | undefined)[]) {
  const q = parts.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

// Last word of the event name in orange, per the mockup.
function EventTitle({ name }: { name: string }) {
  const words = name.split(" ");
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <span className="text-[#f27a00]">{last}</span>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventBySlug(slug);
  if (!ev) return { title: "Event" };
  return {
    title: ev.name,
    description:
      ev.shortDescription ||
      `${ev.name} — SerenArt event in ${ev.city ?? "Nigeria"}.`,
    openGraph: ev.coverImage ? { images: [{ url: ev.coverImage }] } : undefined,
  };
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const ev = await getEventBySlug(slug);
  if (!ev) return notFound();

  const ticketTypes = await listTicketTypesBySlug(slug);
  let siteSettings = null;
  try {
    siteSettings = await settingsService.getPublic();
  } catch { /* env defaults */ }
  const fewLeft = siteSettings?.fewLeftThreshold ?? 10;

  const statusLabel = eventStatusLabel({
    statusOverride: ev.statusOverride,
    ticketTypes,
    fewLeftThreshold: fewLeft,
  });

  const eventFaqs = await contentService.faqsForEvent([...(ev.tags ?? []), ev.eventType ?? ""]);
  const wa = whatsappUrl(`Hi SerenArt! I have a question about ${ev.name}.`);
  const policies = siteSettings?.policies ?? siteConfig.policies;

  const goodToKnow = [
    { title: "Age limit", body: policies.ageLimit || siteConfig.policies.ageLimit },
    { title: "What to wear", body: policies.whatToWear || siteConfig.policies.whatToWear },
    { title: "Running late", body: policies.runningLate || siteConfig.policies.runningLate },
    {
      title: "Refunds",
      body: (
        <>
          {siteSettings?.refundSummary || siteConfig.policies.refunds}{" "}
          <Link
            href="/refunds"
            className="font-semibold text-[#003118] underline decoration-[#f27a00] underline-offset-4 hover:text-[#f27a00]"
          >
            Read the full policy
          </Link>
        </>
      ),
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.name,
    description: ev.shortDescription || ev.description,
    startDate: ev.startsAt,
    endDate: ev.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: ev.venueName,
      address: [ev.venueAddress, ev.city, ev.country]
        .filter(Boolean)
        .join(", "),
    },
    image: ev.coverImage ? [ev.coverImage] : undefined,
    organizer: { "@type": "Organization", name: "SerenArt" },
  };

  return (
    <main className="min-h-screen bg-[#fffedd] pb-24 text-[#1a1a1a] lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        <Link
          href="/events"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#6B6B65] transition-colors hover:text-[#003118]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          All events
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 lg:px-10 lg:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#003118]">
          <div className="relative aspect-[16/8] min-h-[430px] w-full sm:min-h-[500px]">
            {ev.coverImage ? (
              <Image
                src={ev.coverImage}
                alt={ev.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
            ) : (
              <Img
                image={{
                  ...images.eventFallback,
                  aspect: "16/9",
                  tint: "green",
                  label: `PHOTO · ${ev.name.toUpperCase()}`,
                }}
                rounded="rounded-none"
                className="absolute inset-0 !aspect-auto"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />

            <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
              <span className="inline-flex items-center rounded-full bg-[#f27a00] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#003118]">
                {statusLabel}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                <EventTitle name={ev.name} />
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90 sm:text-base">
                <span className="flex items-center gap-2">
                  <span className="text-[#f27a00]">●</span>
                  {formatEventDate(ev.startsAt)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[#f27a00]">●</span>
                  {formatEventTime(ev.startsAt)}
                </span>
                {(ev.venueName || ev.city) && (
                  <span className="flex items-center gap-2">
                    <span className="text-[#f27a00]">●</span>
                    {[ev.venueName, ev.city].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              <a
                href="#tickets"
                className="btn btn-orange mt-6 sm:hidden"
              >
                Get Tickets
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <article className="min-w-0 space-y-12">
            {/* About */}
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                About Event
              </h2>
              <div className="mt-5 max-w-3xl text-[17px] leading-8 text-[#575750]">
                {ev.description ? (
                  <div className="whitespace-pre-line">{ev.description}</div>
                ) : (
                  <p>
                    Pick a canvas, pick a colour, and follow along while our
                    host walks you through a painting. Never held a brush?
                    Perfect.
                  </p>
                )}
              </div>
              {ev.tags && ev.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {ev.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-semibold text-[#003118]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What's included */}
            {ev.includes && ev.includes.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                  What&rsquo;s included
                </h2>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {ev.includes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#e0dfcf] bg-white px-4 py-2 text-sm font-medium text-[#003118]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Where */}
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                Where
              </h2>
              <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">
                <Img
                  image={{
                    ...images.eventFallback,
                    aspect: "21/9",
                    tint: "green",
                    label: `MAP · ${(ev.venueName || ev.city || "VENUE").toUpperCase()}`,
                  }}
                  rounded="rounded-none"
                />
                <div className="p-6">
                  <div className="font-semibold text-[#003118]">
                    {ev.venueName || "Venue to be announced"}
                  </div>
                  {(ev.venueAddress || ev.city) && (
                    <div className="mt-1 text-sm text-[#6b6b6b]">
                      {[ev.venueAddress, ev.city].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {ev.directions && (
                    <p className="mt-3 text-sm leading-6 text-[#575750]">
                      {ev.directions}
                    </p>
                  )}
                  <a
                    href={
                      ev.mapLink ||
                      mapsUrl([ev.venueName, ev.venueAddress, ev.city])
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline mt-4 !min-h-0 px-4 py-2 text-sm"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Good to know — accordion */}
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                Good to know
              </h2>
              <Accordion className="mt-5" items={goodToKnow} />
            </div>

            {/* FAQs */}
            {eventFaqs.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                  FAQs
                </h2>
                <Accordion
                  className="mt-5"
                  items={eventFaqs.map((f) => ({ title: f.q, body: f.a }))}
                />
              </div>
            )}

            {/* Questions? */}
            {wa && (
              <div className="rounded-3xl bg-[#e7efe9] p-7">
                <h2 className="font-display text-xl font-semibold text-[#003118]">
                  Questions?
                </h2>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-green mt-4"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}
          </article>

          {/* Tickets — sticky card */}
          <aside id="tickets" className="scroll-mt-24 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="bg-[#003118] px-6 py-7 text-white sm:px-7">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Get your ticket
                </h2>
              </div>
              <TicketPicker
                slug={slug}
                eventId={ev.id}
                eventName={ev.name}
                ticketTypes={ticketTypes}
              />
            </div>
          </aside>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e0dfcf] bg-white/95 p-3 backdrop-blur lg:hidden">
        <a
          href="#tickets"
          className="flex w-full items-center justify-center rounded-full bg-[#f27a00] py-3.5 text-sm font-bold text-[#003118]"
        >
          Get Tickets
        </a>
      </div>
    </main>
  );
}
