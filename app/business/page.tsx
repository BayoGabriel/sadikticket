import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { whatsappUrl } from "@/lib/site-config";
import { contentService } from "@/services/contentService";
import { settingsService } from "@/services/settingsService";
import { copyGetter, withSiteImage } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "SerenArt Business | Team experiences and brand events",
  description:
    "Painting sessions, game days, staff parties and brand activations for companies that want their people — and their customers — to have a great time.",
};

const whatWeDo = [1, 2, 3, 4];

const howWeWork = [1, 2, 3];

const ways = [1, 2, 3];

export const dynamic = "force-dynamic";

export default async function BusinessPage() {
  const [clients, settings, c] = await Promise.all([
    contentService.clients(),
    settingsService.getPublic().catch(() => null),
    contentService.siteContent(),
  ]);
  const t = copyGetter(c);
  const responseTime = settings?.responseTime;
  const wa = whatsappUrl("Hi SerenArt Business! I'd like to plan a team experience.");
  const whyUs = t("biz.why.items").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      {/* Hero — same brand, calmer tone */}
      <section className="border-b border-[#ecebd8] bg-[#003118]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#f27a00]">
              {t("biz.eyebrow")}
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl">
              {t("biz.hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              {t("biz.hero.sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#enquire"
                className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c00]"
              >
                {t("biz.hero.cta1")}
              </a>
              <a
                href="#our-work"
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("biz.hero.cta2")}
              </a>
            </div>
          </div>
          <Img image={withSiteImage(images.business.hero, "img.biz.hero", c)} />
        </div>
      </section>

      {/* What we do */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
          {t("biz.what.title")}
        </h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whatWeDo.map((n) => (
            <div key={n} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#003118]">{t(`biz.what.${n}.title`)}</h3>
              <p className="mt-2 text-sm leading-6 text-[#575750]">{t(`biz.what.${n}.body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us + how we work */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              {t("biz.why.title")}
            </h2>
            <ol className="mt-6 space-y-4">
              {whyUs.map((w, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6eeeb] text-xs font-bold text-[#003118]">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-6 text-[#575750]">{w}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              {t("biz.how.title")}
            </h2>
            <div className="mt-6 space-y-4">
              {howWeWork.map((n) => (
                <div
                  key={n}
                  className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f27a00] text-sm font-bold text-white">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#003118]">{t(`biz.how.${n}.title`)}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#575750]">
                      {t(`biz.how.${n}.body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our work */}
      <section id="our-work" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            {t("biz.work.title")}
          </h2>
          {clients.length > 0 ? (
            <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
              {clients.map((c) => (
                <div
                  key={String(c._id)}
                  className="flex h-16 items-center justify-center rounded-2xl bg-white px-3 text-center text-xs font-semibold text-[#8a8a7d] shadow-sm"
                >
                  {c.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo} alt={c.name} className="max-h-10 max-w-full object-contain" />
                  ) : (
                    c.name
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="marquee marquee-slow mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="marquee-track">
                {[false, true].map((hidden) => (
                  <div
                    key={String(hidden)}
                    aria-hidden={hidden}
                    className="flex shrink-0 items-center gap-4 pr-4"
                  >
                    {Object.values(images.logos).map((logo) => (
                      <div
                        key={logo.src}
                        className="flex h-16 w-40 shrink-0 items-center justify-center rounded-2xl bg-white px-3 shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logo.src} alt={logo.alt} className="max-h-10 max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {clients.length > 0
              ? clients.map((c) => (
                  <div
                    key={String(c._id)}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <Img
                      image={
                        c.photo
                          ? { src: c.photo, alt: c.name, aspect: "4/3", label: c.name.toUpperCase() }
                          : images.business.work1
                      }
                      rounded="rounded-none"
                    />
                    <div className="p-5">
                      <div className="font-semibold text-[#003118]">
                        {c.name}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[#8a8a7d]">
                        {c.engagement}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#575750]">
                        {c.description}
                      </p>
                      {c.quote && (
                        <blockquote className="mt-3 border-l-2 border-[#f27a00] pl-3 text-sm italic leading-6 text-[#575750]">
                          “{c.quote}”
                        </blockquote>
                      )}
                    </div>
                  </div>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm"
                  >
                    <Img
                      image={
                        [images.business.work1, images.business.work2, images.business.work3][i]
                      }
                      rounded="rounded-none"
                    />
                    <div className="p-5">
                      <div className="font-semibold text-[#003118]">
                        [Client name]
                      </div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[#8a8a7d]">
                        [Type of engagement]
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#575750]">
                        [Short description of what we did.]
                      </p>
                      <blockquote className="mt-3 border-l-2 border-[#f27a00] pl-3 text-sm italic leading-6 text-[#575750]">
                        “[Approved testimonial or result.]”
                      </blockquote>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Ways to work with us */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            {t("biz.ways.title")}
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {ways.map((n) => (
              <div key={n} className="rounded-3xl bg-white p-7 shadow-sm">
                <h3 className="text-lg font-semibold text-[#003118]">
                  {t(`biz.ways.${n}.name`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#575750]">
                  {t(`biz.ways.${n}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry — id must match the header's /business#enquire CTA */}
      <section id="enquire" className="scroll-mt-24">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              {t("biz.form.title")}
            </h2>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
              >
                Prefer WhatsApp? Chat with us
              </a>
            )}
          </div>
          <div className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <EnquiryForm kind="business" responseTime={responseTime} />
          </div>
        </div>
      </section>
    </main>
  );
}
