import Link from "next/link";
import type { Metadata } from "next";

import { getEvents } from "@/features/events/server";
import { reviewService } from "@/services/reviewService";
import { contentService } from "@/services/contentService";
import { copyGetter, withSiteImage } from "@/lib/site-copy";
import { EventCard } from "@/components/events/EventCard";
import { ProductCard } from "@/components/shop/ProductCard";
import { Img } from "@/components/ui/Img";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { Star } from "@/components/decorative/Doodles";
import { images, type ImageSlot } from "@/lib/images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "SerenArt — Life's Too Short for Boring Plans",
  description:
    "Create art, vibe to your favourite playlists, meet your people and have a good time, with absolutely no pressure to be Picasso.",
};

// Last 2 words in orange — keeps the designed accent while the whole
// sentence stays admin-editable.
const accent2 = (s: string) => {
  const parts = s.split(" ");
  const tail = parts.splice(-2).join(" ");
  return (
    <>
      {parts.join(" ")} <span className="text-[#f27a00]">{tail}</span>
    </>
  );
};

const proofSlots = [
  images.gallery.g1,
  images.gallery.g2,
  images.gallery.g3,
  images.gallery.g4,
  images.gallery.g5,
  images.gallery.g6,
];

export default async function HomePage() {
  const [{ items: events }, reviews, products, c] = await Promise.all([
    getEvents({ limit: 4 }),
    reviewService.listApproved(3),
    contentService.products(),
    contentService.siteContent(),
  ]);
  const t = copyGetter(c);
  const img = (s: ImageSlot, k: string) => withSiteImage(s, k, c);

  const tickerItems = t("home.ticker.items")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const moods = [
    {
      title: t("home.moods.1.title"),
      body: t("home.moods.1.body"),
      image: img(images.moods.creative, "img.home.moods.creative"),
      cls: "bg-[#f27a00] text-[#003118]",
    },
    {
      title: t("home.moods.2.title"),
      body: t("home.moods.2.body"),
      image: img(images.moods.social, "img.home.moods.social"),
      cls: "bg-[#e7efe9] text-[#003118]",
    },
    {
      title: t("home.moods.3.title"),
      body: t("home.moods.3.body"),
      image: img(images.moods.outdoor, "img.home.moods.outdoor"),
      cls: "bg-[#003118] text-[#fffedd]",
    },
  ];

  const steps = [1, 2, 3].map((n) => ({
    n,
    title: t(`home.steps.${n}.title`),
    body: t(`home.steps.${n}.body`),
  }));

  return (
    <main className="bg-[#fffedd]">
      {/* 1 ─ Hero + ticker */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pt-20">
        <div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-[#003118] sm:text-6xl lg:text-7xl">
            {accent2(t("home.hero.title"))}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#575750]">
            {t("home.hero.sub")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-orange">
              {t("home.hero.cta1")}
            </Link>
            <Link href="/private-bookings" className="btn btn-outline">
              {t("home.hero.cta2")}
            </Link>
          </div>
        </div>

        {/* overlapping photo collage, slightly rotated */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Star className="absolute -top-4 right-6 h-8 w-8 rotate-12 text-[#f27a00]" />
          <div className="grid grid-cols-3 items-center gap-3">
            <Img
              image={img(images.hero.canvas, "img.home.hero.canvas")}
              priority
              className="-rotate-3 shadow-md"
            />
            <Img
              image={img(images.hero.karaoke, "img.home.hero.karaoke")}
              priority
              className="mt-10 rotate-2 shadow-md"
            />
            <Img
              image={img(images.hero.picnic, "img.home.hero.picnic")}
              priority
              className="-mb-8 rotate-4 shadow-md"
            />
          </div>
        </div>
      </section>
      <Marquee items={tickerItems} />

      {/* 2 ─ We're SerenArt */}
      <section className="bg-[#003118]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <Reveal>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#fffedd] sm:text-5xl">
              {t("home.serenart.title")}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#fffedd]/75">
              {t("home.serenart.p1")}
            </p>
            <p className="mt-4 max-w-lg text-base leading-7 text-[#fffedd]/75">
              {t("home.serenart.p2")}
            </p>
            <Link href="/experiences" className="btn btn-orange mt-7">
              {t("home.serenart.cta")}
            </Link>
          </Reveal>
          <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
            <Img image={img(images.whoWeAre.main, "img.home.whoweare.main")} className="rotate-2 shadow-md" />
            <Img
              image={img(images.whoWeAre.offset, "img.home.whoweare.offset")}
              className="mt-12 -rotate-2 shadow-md"
            />
          </div>
        </div>
      </section>

      {/* 3 ─ Upcoming events */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
              {t("home.events.title")}
            </h2>
            <Link
              href="/events"
              className="text-sm font-bold text-[#003118] underline decoration-[#f27a00] decoration-2 underline-offset-4 hover:text-[#f27a00]"
            >
              {t("home.events.link")}
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

      {/* 4 ─ Got something to celebrate? */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
          {accent2(t("home.celebrate.title"))}
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-[#fdd3a2]">
            <Img
              image={img(images.celebrate.private, "img.home.celebrate.private")}
              rounded="rounded-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="p-8">
              <h3 className="font-display text-2xl font-semibold text-[#003118]">
                {t("home.celebrate.private.title")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#003118]/80">
                {t("home.celebrate.private.body")}
              </p>
              <Link href="/private-bookings" className="btn btn-orange mt-5">
                {t("home.celebrate.private.cta")}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-[#003118]">
            <Img
              image={img(images.celebrate.business, "img.home.celebrate.business")}
              rounded="rounded-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="p-8">
              <h3 className="font-display text-2xl font-semibold text-[#fffedd]">
                {t("home.celebrate.business.title")}
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#f27a00]">
                {t("home.celebrate.business.tag")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#fffedd]/75">
                {t("home.celebrate.business.body")}
              </p>
              <Link href="/business" className="btn btn-orange mt-5">
                {t("home.celebrate.business.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5 ─ What are you in the mood for? */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
            {t("home.moods.title")}
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
            {t("home.moods.cta")}
          </Link>
        </div>
      </section>

      {/* 6 ─ Easy, we promise */}
      <section className="bg-[#003118] text-[#fffedd]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {t("home.steps.title")}
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

      {/* 7 ─ Shop */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
                {t("home.shop.title")}
              </h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-[#575750]">
                {t("home.shop.tagline")}
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-bold text-[#003118] underline decoration-[#f27a00] decoration-2 underline-offset-4 hover:text-[#f27a00]"
            >
              {t("home.shop.link")}
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
              {products.slice(0, 4).map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  className={i === 3 ? "lg:hidden" : ""}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 columns-2 gap-4 sm:columns-3">
              {proofSlots.map((img, i) => (
                <Img
                  key={i}
                  image={img}
                  className={`mb-4 break-inside-avoid ${i >= 4 ? "hidden sm:block" : ""}`}
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              ))}
            </div>
          )}

          <h3 className="mt-14 text-center text-lg font-bold uppercase tracking-[0.2em] text-black sm:text-xl">
            {t("home.brands.title")}
          </h3>
          <div className="marquee marquee-slow mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="marquee-track">
              {[false, true].map((hidden) => (
                <div
                  key={String(hidden)}
                  aria-hidden={hidden}
                  className="flex shrink-0 items-center gap-10 pr-10"
                >
                  {Object.values(images.logos).map((logo, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={logo.src}
                      alt={logo.alt}
                      className="h-8 w-auto"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
            <h3 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#003118]">
              {t("home.reviews.title")}
            </h3>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={siteConfig.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[#003118] underline decoration-[#f27a00] decoration-2 underline-offset-4 hover:text-[#f27a00]"
              >
                {t("home.reviews.link")}
              </a>
            </div>
          </div>
          {reviews.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {reviews.map((r) => (
                <figure
                  key={r.id}
                  className="rounded-3xl bg-white p-7 shadow-sm"
                >
                  {r.source === "google" && (
                    <div className="mb-3 flex items-center gap-2">
                      <span aria-hidden className="text-sm tracking-tight text-[#f27a00]">
                        {"★".repeat(r.rating ?? 5)}
                        <span className="text-[#e8e8e5]">
                          {"★".repeat(5 - (r.rating ?? 5))}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-[#8a8a7d]">
                        Google review
                      </span>
                    </div>
                  )}
                  <blockquote className="text-sm leading-7 text-[#575750]">
                    &ldquo;{r.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 text-xs font-bold text-[#003118]">
                    {r.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photo}
                        alt={r.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    )}
                    <span>
                      {r.name}
                      {r.context ? ` · ${r.context}` : ""}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          <div className="mt-6 overflow-hidden rounded-3xl shadow-sm">
            <iframe
              src={siteConfig.googleMapsEmbedUrl}
              title="SerenArt on Google Maps — ratings and reviews"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0"
            />
          </div>
        </div>
      </section>

      {/* 8 ─ Last push */}
      <section className="bg-[#f27a00]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-[#003118] sm:text-5xl">
            {t("home.cta.title")}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-green">
              {t("home.cta.primary")}
            </Link>
            <Link href="/private-bookings" className="btn btn-outline">
              {t("home.cta.secondary")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
