import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { contentService } from "@/services/contentService";
import { copyGetter, withSiteImage } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "About | SerenArt",
  description:
    "We believe life should be about more than routines. Here's who we are.",
};

export default async function AboutPage() {
  const c = await contentService.siteContent();
  const t = copyGetter(c);
  const beliefs = [1, 2, 3].map((n) => ({
    title: t(`about.beliefs.${n}.title`),
    body: t(`about.beliefs.${n}.body`),
  }));
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:px-10">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#4a4a45] sm:text-lg">
            {t("about.p1")}
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#4a4a45]">
            {t("about.p2")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/experiences" className="btn btn-green">
              {t("about.cta1")}
            </Link>
            <Link href="/events" className="btn btn-outline">
              {t("about.cta2")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Img image={withSiteImage(images.about.team1, "img.about.team1", c)} />
          <Img image={withSiteImage(images.about.team2, "img.about.team2", c)} className="translate-y-6" />
        </div>
      </section>

      {/* What we believe */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            {t("about.beliefs.title")}
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {beliefs.map((b) => (
              <div key={b.title} className="rounded-3xl bg-white p-7 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-[#003118]">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#575750]">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-8 rounded-[2rem] bg-[#f27a00] p-8 sm:p-12 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              {t("about.cta.title")}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#003118]/80 sm:text-base">
              {t("about.cta.sub")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/events" className="btn btn-green">
                See upcoming events
              </Link>
              <Link
                href="/private-bookings"
                className="inline-flex min-h-11 items-center rounded-full border-2 border-[#003118]/30 px-6 py-3 text-sm font-semibold text-[#003118] transition hover:border-[#003118]"
              >
                Plan something with us
              </Link>
            </div>
          </div>
          <Img image={images.about.team3} />
        </div>
      </section>
    </main>
  );
}
