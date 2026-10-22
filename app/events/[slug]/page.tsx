import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getEventBySlug, listTicketTypesBySlug } from "@/features/checkout/api";
import { TicketPicker } from "@/components/events/TicketPicker";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function mapsUrl(parts: (string | undefined)[]) {
  const q = parts.filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
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

  const now = new Date();
  const onSaleTypes = ticketTypes.filter(
    (t) =>
      t.isOnSale !== false &&
      (!t.salesStart || new Date(t.salesStart) <= now) &&
      (!t.salesEnd || new Date(t.salesEnd) >= now),
  );
  const remaining = onSaleTypes.reduce(
    (acc, t) => acc + (t.quantityAvailable ?? 0),
    0,
  );
  const statusLabel =
    ticketTypes.length === 0 || onSaleTypes.length === 0
      ? "Coming soon"
      : remaining <= 0
        ? "Sold out"
        : remaining <= 10
          ? "Few tickets left"
          : "Tickets on sale";

  const goodToKnow = [
    {
      title: "Age limit",
      body: "Check the event description — or ask us and we'll confirm.",
    },
    {
      title: "What to wear",
      body: "Come comfortable. Where things get messy, we've got you covered.",
    },
    {
      title: "Running late",
      body: "Life happens. Message us on WhatsApp and we'll do our best.",
    },
    {
      title: "Refunds",
      body: "Plans change — refunds and cancellations are handled per our policy.",
      link: { href: "/refunds", label: "Read the full policy" },
    },
  ];

  return (
    <main className="min-h-screen bg-[#fffedd] pb-24 text-[#1a1a1a] lg:pb-0">
      {/* Breadcrumb */}
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
        <div className="relative overflow-hidden rounded-[2rem] bg-[#003118] shadow-[0_24px_70px_rgba(0,49,24,0.16)]">
          <div className="relative aspect-[16/8] min-h-[430px] w-full sm:min-h-[500px]">
            {ev.coverImage && (
              <Image
                src={ev.coverImage}
                alt={ev.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />
            <div className="absolute right-8 top-8 hidden h-20 w-20 rotate-12 rounded-full border-[10px] border-[#f27a00]/80 sm:block" />

            <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
              <span className="inline-flex items-center rounded-full bg-[#f27a00] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">
                {statusLabel}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                  {ev.name}
                </h1>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/90 sm:text-base">
                  <span className="flex items-center gap-2">
                    <span className="text-[#f27a00]">●</span>
                    {formatDate(ev.startsAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[#f27a00]">●</span>
                    {formatTime(ev.startsAt)}
                  </span>
                  {(ev.venueName || ev.city) && (
                    <span className="flex items-center gap-2">
                      <span className="text-[#f27a00]">●</span>
                      {[ev.venueName, ev.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
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
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                About Event
              </h2>
              <div className="mt-5 max-w-3xl text-[17px] leading-8 text-[#575750]">
                {ev.description ? (
                  <div className="whitespace-pre-line">{ev.description}</div>
                ) : (
                  <p>
                    Pick a canvas, pick a colour, and follow along while our
                    host walks you through it. Never done this before? Perfect.
                  </p>
                )}
              </div>
            </div>

            {/* What's included */}
            {ev.includes && ev.includes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                  What’s included
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
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                Where
              </h2>
              <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="flex h-36 items-end bg-gradient-to-br from-[#003118] via-[#0a4a2c] to-[#f27a00]/50 p-5">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">
                    Map · {ev.venueName || ev.city || "Venue"}
                  </span>
                </div>
                <div className="p-6">
                  <div className="font-semibold text-[#003118]">
                    {ev.venueName || "Venue to be announced"}
                  </div>
                  {(ev.venueAddress || ev.city) && (
                    <div className="mt-1 text-sm text-[#6b6b6b]">
                      {[ev.venueAddress, ev.city].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <a
                    href={mapsUrl([ev.venueName, ev.venueAddress, ev.city])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center rounded-full border border-[#003118]/25 px-4 py-2 text-sm font-semibold text-[#003118] transition hover:bg-[#e6eeeb]"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Good to know */}
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
                Good to know
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {goodToKnow.map((g) => (
                  <div
                    key={g.title}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857d]">
                      {g.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#575750]">
                      {g.body}
                    </p>
                    {g.link && (
                      <Link
                        href={g.link.href}
                        className="mt-2 inline-block text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
                      >
                        {g.link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Tickets */}
          <aside id="tickets" className="scroll-mt-24 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              <div className="bg-[#003118] px-6 py-7 text-white sm:px-7">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                  Tickets
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Get your ticket
                </h2>
              </div>
              <TicketPicker
                slug={slug}
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
          className="flex w-full items-center justify-center rounded-full bg-[#f27a00] py-3.5 text-sm font-semibold text-white"
        >
          Get Tickets
        </a>
      </div>
    </main>
  );
}
