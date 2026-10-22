import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { whatsappUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "SerenArt Business | Team experiences and brand events",
  description:
    "Painting sessions, game days, staff parties and brand activations for companies that want their people — and their customers — to have a great time.",
};

const whatWeDo = [
  {
    title: "Team bonding",
    body: "Creative sessions, games and challenges, department socials. Good for new teams, old teams and teams that don't talk enough.",
  },
  {
    title: "Celebrations",
    body: "End-of-year parties, staff appreciation, anniversaries and milestones.",
  },
  {
    title: "Retreats and wellness",
    body: "Offsites, retreats, art and relaxation sessions, outdoor days.",
  },
  {
    title: "Brand experiences",
    body: "Brand activations, launches, customer events and custom experiences for your audience.",
  },
];

// TODO before launch: back each of these points with a real photo or client
// story — generic claims won't sell the page on their own.
const whyUs = [
  "We start with what you want out of the day, then build around it.",
  "Activities that get everyone involved, not just the loud ones.",
  "Built around your team size, mood and budget.",
  "We plan and run it, so you don't have to.",
  "A reason for people to talk to someone outside their usual circle.",
];

const howWeWork = [
  {
    n: "1",
    title: "Brief us",
    body: "Tell us your goal, team size, date and rough budget.",
  },
  {
    n: "2",
    title: "Get a proposal",
    body: "We send ideas and a clear quote.",
  },
  {
    n: "3",
    title: "We run the day",
    body: "You turn up and enjoy it too.",
  },
];

const ways = [
  { name: "One-off", body: "A single event or team day." },
  {
    name: "Regular",
    body: "Monthly or quarterly sessions for your team.",
  },
  {
    name: "Custom",
    body: "A full programme built around your company.",
  },
];

export default function BusinessPage() {
  const wa = whatsappUrl("Hi SerenArt Business! I'd like to plan a team experience.");
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      {/* Hero — same brand, calmer tone */}
      <section className="border-b border-[#ecebd8] bg-[#003118]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#f27a00]">
              SerenArt Business
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-5xl">
              Your team deserves better than another meeting.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Painting sessions, game days, staff parties and brand activations
              for companies that want their people, and their customers, to have
              a great time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#enquire"
                className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d56c00]"
              >
                Plan a team experience
              </a>
              <a
                href="#our-work"
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See our work
              </a>
            </div>
          </div>
          <Img image={images.business.hero} />
        </div>
      </section>

      {/* What we do */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
          What we do
        </h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whatWeDo.map((w) => (
            <div key={w.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#003118]">{w.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#575750]">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why us + how we work */}
      <section className="border-t border-[#ecebd8] bg-[#fffdf0]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
              Why companies pick us
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
              How we work
            </h2>
            <div className="mt-6 space-y-4">
              {howWeWork.map((s) => (
                <div
                  key={s.n}
                  className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f27a00] text-sm font-bold text-white">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#003118]">{s.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#575750]">
                      {s.body}
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
            Companies we’ve worked with
          </h2>
          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex h-16 items-center justify-center rounded-2xl bg-white text-xs font-semibold text-[#8a8a7d] shadow-sm"
              >
                Client logo
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
            Ways to work with us
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-3">
            {ways.map((w) => (
              <div key={w.name} className="rounded-3xl bg-white p-7 shadow-sm">
                <h3 className="text-lg font-semibold text-[#003118]">
                  {w.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#575750]">
                  {w.body}
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
              Tell us about your team
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
            <EnquiryForm kind="business" />
          </div>
        </div>
      </section>
    </main>
  );
}
