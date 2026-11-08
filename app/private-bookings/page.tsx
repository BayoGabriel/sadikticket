import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { contentService } from "@/services/contentService";
import { settingsService } from "@/services/settingsService";
import { copyGetter, withSiteImage } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Private Bookings | SerenArt",
  description:
    "Birthdays, bridal showers, date nights, hangouts — tell us the plan and we'll help you pull it off.",
};

const occasionSlots = [
  images.privateBookings.birthdays,
  images.privateBookings.showers,
  images.privateBookings.anniversaries,
  images.privateBookings.hangouts,
  images.privateBookings.reunions,
  images.privateBookings.somethingElse,
];

const accent2 = (s: string) => {
  const parts = s.split(" ");
  const tail = parts.splice(-2).join(" ");
  return (
    <>
      {parts.join(" ")} <span className="text-[#f27a00]">{tail}</span>
    </>
  );
};

export const dynamic = "force-dynamic";

export default async function PrivateBookingsPage() {
  const [settings, experienceList, c] = await Promise.all([
    settingsService.getPublic().catch(() => null),
    contentService.experiences().catch(() => ({ items: [], images: {} })),
    contentService.siteContent(),
  ]);
  const t = copyGetter(c);
  const occasions = occasionSlots.map((img, i) => ({
    name: t(`pb.occasions.${i + 1}.name`),
    line: t(`pb.occasions.${i + 1}.line`),
    img: withSiteImage(img, `img.pb.occasions.${i + 1}`, c),
  }));
  const steps = [1, 2, 3].map((n) => ({
    n: String(n),
    title: t(`pb.steps.${n}.title`),
    body: t(`pb.steps.${n}.body`),
  }));
  const responseTime = settings?.responseTime;
  // Options for the "preferred experience" question — edited in
  // admin → Content → Experiences.
  const experienceOptions = experienceList.items.map((e) => e.name);
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      {/* Hero — peach */}
      <section className="bg-[#fdd3a2]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:px-10">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#003118] sm:text-5xl">
              {accent2(t("pb.hero.title"))}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#003118]/80 sm:text-lg">
              {t("pb.hero.sub")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#enquiry" className="btn btn-green">
                {t("pb.hero.cta1")}
              </a>
              <Link href="/business" className="btn btn-outline">
                {t("pb.hero.cta2")}
              </Link>
            </div>
          </div>
          <Img image={withSiteImage(images.privateBookings.hero, "img.pb.hero", c)} />
        </div>
      </section>

      {/* What are you celebrating */}
      <section className="bg-[#fffedd]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            {t("pb.occasions.title")}
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((o) => (
              <div
                key={o.name}
                className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1"
              >
                <Img image={o.img} rounded="rounded-none" />
                <div className="p-5">
                  <h3 className="font-semibold text-[#003118]">{o.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#575750]">
                    {o.line}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — dark green band */}
      <section className="bg-[#003118]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#fffedd] sm:text-3xl">
            {t("pb.steps.title")}
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-3xl bg-[#0c4a2b] p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f27a00] font-display text-base font-bold text-[#003118]">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold text-[#fffedd]">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#fffedd]/70">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section
        id="enquiry"
        className="scroll-mt-24 border-t border-[#ecebd8] bg-[#fffdf0]"
      >
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            {t("pb.form.title")}
          </h2>
          <div className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <EnquiryForm
              kind="private-booking"
              responseTime={responseTime}
              experienceOptions={experienceOptions}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
