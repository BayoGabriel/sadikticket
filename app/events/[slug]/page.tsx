import { notFound } from "next/navigation";
import Image from "next/image";

import { getEventBySlug, listTicketTypesBySlug } from "@/features/checkout/api";

import { Blob } from "@/components/decorative/Blob";
import { AccentCircle } from "@/components/decorative/AccentCircle";
import { BrushShape } from "@/components/decorative/BrushShape";

function Price({ amount, currency }: { amount: number; currency: string }) {
  // Backend provides minor units (e.g., kobo). Convert to major for display.
  const major = Math.round(amount) / 100;
  const symbol = currency === "NGN" ? "₦" : `${currency} `;
  return (
    <span className="font-semibold tracking-tight">
      {symbol}
      {major.toLocaleString(undefined, { minimumFractionDigits: 0 })}
    </span>
  );
}

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

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const ev = await getEventBySlug(slug);

  if (!ev) return notFound();

  const ticketTypes = await listTicketTypesBySlug(slug);
  {
    console.log("ticketTypes.length", ticketTypes.length);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F7F3] text-[#171717]">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <Blob
          className="absolute -left-48 top-20 h-96 w-96"
          color="#E1ECE7"
          opacity={0.7}
        />

        <AccentCircle className="absolute -right-32 top-40 h-80 w-80" />

        <BrushShape
          className="absolute left-1/2 top-[420px] h-72 w-[480px] -translate-x-1/2"
          color="#FFE0C8"
          opacity={0.35}
        />
      </div>

      {/* Breadcrumb / back */}
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10">
        <a
          href="/events"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#6B6B65] transition-colors hover:text-[#004130]"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          All experiences
        </a>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pb-0 pt-6 sm:px-8 lg:px-10 lg:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#004130] shadow-[0_24px_70px_rgba(0,65,48,0.16)]">
          {ev.coverImage ? (
            <>
              <div className="relative aspect-[16/8] min-h-[430px] w-full sm:min-h-[500px]">
                <Image
                  src={ev.coverImage}
                  alt={ev.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />

                {/* Image treatment */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />

                <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

                {/* Accent */}
                <div className="absolute right-8 top-8 hidden h-20 w-20 rotate-12 rounded-full border-[10px] border-[#E66D0B]/80 sm:block" />

                {/* Hero content */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
                  <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                      Experience
                    </div>

                    <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                      {ev.name}
                    </h1>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white/90 sm:text-base">
                      <span className="flex items-center gap-2">
                        <span className="text-[#E66D0B]">●</span>
                        {formatDate(ev.startsAt)}
                      </span>

                      <span className="flex items-center gap-2">
                        <span className="text-[#E66D0B]">●</span>
                        {formatTime(ev.startsAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="relative flex min-h-[430px] items-end overflow-hidden bg-[#004130] p-6 sm:min-h-[500px] sm:p-10 lg:p-14">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[45px] border-[#E66D0B]/30" />

              <div className="absolute bottom-20 right-24 h-32 w-32 rotate-12 rounded-[35%] bg-[#E66D0B]/20" />

              <div className="relative max-w-3xl">
                <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                  Experience
                </div>

                <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                  {ev.name}
                </h1>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80 sm:text-base">
                  <span>{formatDate(ev.startsAt)}</span>
                  <span>{formatTime(ev.startsAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          {/* About */}
          <article className="min-w-0">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#E66D0B]" />

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B6B65]">
                  About the experience
                </span>
              </div>

              <h2 className="text-3xl font-semibold tracking-[-0.025em] text-[#004130] sm:text-4xl">
                Come for the experience.
                <br />
                Stay for the memories.
              </h2>

              <div className="mt-7 text-[17px] leading-8 text-[#575750]">
                {ev.description ? (
                  <div className="whitespace-pre-line">{ev.description}</div>
                ) : (
                  <p>
                    Join us for this experience and create something worth
                    remembering.
                  </p>
                )}
              </div>
            </div>

            {/* Event information */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="mb-3 text-2xl">◷</div>

                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857D]">
                  Date & time
                </div>

                <div className="mt-2 font-semibold text-[#004130]">
                  {formatDate(ev.startsAt)}
                </div>

                <div className="mt-1 text-sm text-[#6B6B65]">
                  {formatTime(ev.startsAt)}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="mb-3 text-2xl">✦</div>

                <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#85857D]">
                  Tickets
                </div>

                <div className="mt-2 font-semibold text-[#004130]">
                  {ticketTypes.length > 0
                    ? `${ticketTypes.length} ticket ${
                        ticketTypes.length === 1 ? "option" : "options"
                      }`
                    : "Currently unavailable"}
                </div>

                <div className="mt-1 text-sm text-[#6B6B65]">
                  Choose the experience that suits you
                </div>
              </div>
            </div>
          </article>

          {/* Ticket selector */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
              {/* Header */}
              <div className="bg-[#004130] px-6 py-7 text-white sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
                      Tickets
                    </div>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Choose your ticket
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      Select your ticket type and quantity to continue.
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E66D0B] text-lg">
                    →
                  </div>
                </div>
              </div>

              {/* Ticket options */}
              <div className="p-4 sm:p-5">
                {ticketTypes.length > 0 ? (
                  <div className="space-y-3">
                    {ticketTypes.map((ticket) => {
                      const available =
                        typeof ticket.quantityAvailable === "number"
                          ? ticket.quantityAvailable
                          : undefined;
                      const onSale = ticket.isOnSale !== false;
                      const soldOut = available !== undefined && available <= 0;
                      return (
                        <form
                          key={ticket.id}
                          action={`/events/${slug}/checkout`}
                          method="get"
                          className="group rounded-2xl border border-[#E8E7E1] bg-[#FAFAF7] p-4 transition-all hover:-translate-y-0.5 hover:border-[#004130]/30 hover:bg-white hover:shadow-[0_10px_30px_rgba(0,65,48,0.08)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-[#004130]">
                                {ticket.name}
                              </h3>

                              {ticket.description && (
                                <p className="mt-1 text-sm leading-5 text-[#77776F]">
                                  {ticket.description}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 text-right text-[#004130]">
                              <div className="text-lg">
                                <Price
                                  amount={ticket.price}
                                  currency={ticket.currency}
                                />
                              </div>

                              <div className="text-[11px] text-[#85857D]">
                                {soldOut
                                  ? "Sold out"
                                  : !onSale && ticket.salesStart
                                    ? `Sales start ${new Date(ticket.salesStart).toLocaleDateString()}`
                                    : available !== undefined
                                      ? `${available} left`
                                      : "per person"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-3">
                            <label
                              htmlFor={`quantity-${ticket.id}`}
                              className="text-xs font-semibold uppercase tracking-wider text-[#85857D]"
                            >
                              Quantity
                            </label>

                            <input
                              id={`quantity-${ticket.id}`}
                              type="number"
                              name="quantity"
                              min={1}
                              max={Math.max(1, Math.min(10, available ?? 10))}
                              defaultValue={soldOut || !onSale ? 0 : 1}
                              disabled={soldOut || !onSale}
                              aria-label={`Quantity for ${ticket.name}`}
                              className="h-10 w-16 rounded-xl border border-[#DCDCD5] bg-white px-2 text-center text-sm font-semibold text-[#004130] outline-none transition focus:border-[#004130] focus:ring-2 focus:ring-[#004130]/10"
                            />

                            <input
                              type="hidden"
                              name="ticketTypeId"
                              value={ticket.id}
                            />

                            <button
                              type="submit"
                              disabled={soldOut || !onSale}
                              className="ml-auto inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 bg-[#004130] hover:bg-[#00543F]"
                            >
                              {soldOut
                                ? "Unavailable"
                                : !onSale
                                  ? "Not yet on sale"
                                  : "Continue"}
                            </button>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-3 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F3EF] text-2xl text-[#004130]">
                      —
                    </div>

                    <h3 className="mt-4 font-semibold text-[#004130]">
                      Tickets aren't available yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#77776F]">
                      Check back soon for ticket availability.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer reassurance */}
              {ticketTypes.length > 0 && (
                <div className="border-t border-[#EEEDE8] bg-[#FAFAF7] px-5 py-4">
                  <p className="text-center text-xs leading-5 text-[#85857D]">
                    Secure checkout powered by Paystack
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#E66D0B] px-6 py-10 text-center sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full border-[35px] border-white/10" />

          <div className="pointer-events-none absolute -bottom-24 -right-12 h-60 w-60 rotate-12 rounded-[40%] border-[30px] border-white/10" />

          <div className="relative mx-auto max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Make it a day to remember
            </div>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Ready to join the experience?
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
              Pick your ticket above and secure your spot.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
