import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | SerenArt",
  description: "The terms for using the SerenArt website and buying tickets.",
};

const sections = [
  {
    title: "Tickets",
    body: "A ticket is confirmed once payment goes through — you'll get it by email with a QR code for check-in. Keep it handy on the day.",
  },
  {
    title: "Events",
    body: "Event details (venue, time, what's included) are listed on each event page. If anything changes, we email ticket holders.",
  },
  {
    title: "Payments",
    body: "Payments are processed securely by Paystack. We never see or store your card details.",
  },
  {
    title: "Photos and videos",
    body: "We take photos and short videos at our events. If you'd rather not appear, just let a host know on the day.",
  },
  {
    title: "Enquiries",
    body: "Private booking and business enquiries aren't bookings yet — we confirm every detail with you before anything is locked in.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Terms
        </h1>
        <p className="mt-3 text-base leading-7 text-[#4a4a45]">
          The small print, in plain words.
        </p>
        <div className="mt-10 space-y-6 text-sm leading-7 text-[#4a4a45]">
          {sections.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#003118]">
                {s.title}
              </h2>
              <p className="mt-2">{s.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
