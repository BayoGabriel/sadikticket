import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";

export const metadata: Metadata = {
  title: "Private Bookings | SerenArt",
  description:
    "Birthdays, bridal showers, date nights, hangouts — tell us the plan and we'll help you pull it off.",
};

const occasions = [
  { name: "Birthdays", line: "Another year, a better party.", img: images.privateBookings.birthdays },
  {
    name: "Bridal/Baby showers",
    line: "Fun for the bride and everyone who loves her.",
    img: images.privateBookings.showers,
  },
  {
    name: "Anniversaries",
    line: "Something to do together that isn't just dinner.",
    img: images.privateBookings.anniversaries,
  },
  {
    name: "Friends' hangouts",
    line: "Group chat plans, finally happening.",
    img: images.privateBookings.hangouts,
  },
  {
    name: "Reunions",
    line: "Get everyone in one room and give them something to do.",
    img: images.privateBookings.reunions,
  },
  { name: "Something else", line: "Tell us the idea and we'll shape it.", img: images.privateBookings.somethingElse },
];

const steps = [
  {
    n: "1",
    title: "Tell us what you're planning",
    body: "Fill in the short form with your date, group size and the kind of experience you like.",
  },
  {
    n: "2",
    title: "We chat",
    body: "We'll talk through the venue, the details and the budget until it feels right.",
  },
  {
    n: "3",
    title: "Lock it in",
    body: "Once you're happy, we confirm everything and you're set.",
  },
];

export default function PrivateBookingsPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      {/* Hero — peach */}
      <section className="bg-[#fdd3a2]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:px-10">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#003118] sm:text-5xl">
              Got something to celebrate? Make It a{" "}
              <span className="text-[#f27a00]">Whole Vibe.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#003118]/80 sm:text-lg">
              Birthdays, bridal showers, date nights, hangouts with the girls
              (or the boys). Tell us the plan and we’ll help you pull it off.
            </p>
            <a href="#enquiry" className="btn btn-green mt-7">
              Plan my event
            </a>
          </div>
          <Img image={images.privateBookings.hero} />
        </div>
      </section>

      {/* What are you celebrating */}
      <section className="bg-[#fffedd]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#003118] sm:text-3xl">
            What are you celebrating?
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
            How it works
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
            Let’s plan it!
          </h2>
          <div className="mt-7 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <EnquiryForm kind="private-booking" />
          </div>
        </div>
      </section>
    </main>
  );
}
