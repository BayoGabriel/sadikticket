import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "About | SerenArt",
  description:
    "We believe life should be about more than routines. Here's who we are.",
};

const beliefs = [
  {
    title: "Fun is a skill",
    body: "Most people aren't boring — they're just stuck in routines. We make it easy to break out of them.",
  },
  {
    title: "Everyone belongs",
    body: "No experience needed, no coolness required. Come alone, come with your whole street.",
  },
  {
    title: "Show up as you are",
    body: "Aprons for the messy bits, hosts for the nervous bits, good music for everything else.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:px-10">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
            We’re <span className="text-[#f27a00]">SerenArt.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#4a4a45] sm:text-lg">
            We believe life should be about more than routines. It’s about
            trying something new, meeting people, expressing yourself and
            creating moments worth remembering.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#4a4a45]">
            From creative workshops and social events to personalised
            celebrations and corporate experiences, we create spaces where
            people can connect, unwind and have a genuinely good time — in
            Lagos, Benin City, and wherever the vibe takes us next.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/experiences" className="btn btn-green">
              Explore Experiences
            </Link>
            <Link href="/events" className="btn btn-outline">
              See upcoming events
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Img image={images.about.team1} />
          <Img image={images.about.team2} className="translate-y-6" />
        </div>
      </section>

      {/* What we believe */}
      <section className="bg-[#e7efe9]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            What we believe
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
              Ready? Let’s make a night of it.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#003118]/80 sm:text-base">
              Public events in Lagos and Benin City, or a private experience
              planned just for your people.
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
