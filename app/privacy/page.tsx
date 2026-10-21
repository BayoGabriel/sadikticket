import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | SerenArt",
  description: "How SerenArt handles your information.",
};

const sections = [
  {
    title: "What we collect",
    body: "When you buy a ticket we keep your name, email and phone number so we can send your ticket and reach you about the event. Enquiry forms collect the details you give us so we can plan with you.",
  },
  {
    title: "What we use it for",
    body: "Sending tickets, answering enquiries, planning your events, and telling you first about new ones when you ask us to. That's it.",
  },
  {
    title: "Payments",
    body: "Payments go through Paystack. We never see or store your card details.",
  },
  {
    title: "What we don't do",
    body: "We don't sell your details or share them with anyone outside what it takes to run your event — like the venue or payment provider.",
  },
  {
    title: "Your call",
    body: "Want us to update or delete your details? Ask on WhatsApp or by email and we'll sort it.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Privacy
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
