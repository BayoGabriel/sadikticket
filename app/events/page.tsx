import Link from "next/link";
import type { Metadata } from "next";

import { getEvents } from "@/features/events/server";
import { EventCard } from "@/components/events/EventCard";
import { NotifyForm } from "@/components/forms/NotifyForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Upcoming events | SerenArt",
  description:
    "Grab a ticket, bring a friend, come as you are. Public SerenArt events in Lagos and Benin City.",
};

function monthLabel(isoMonth: string) {
  const [y, m] = isoMonth.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-NG", { month: "long" });
}

function buildUrl(base: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/events?${s}` : "/events";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const city = sp?.city || undefined;
  const month = sp?.month || undefined;
  const q = sp?.q || undefined;

  const result = await getEvents({
    search: q,
    city,
    month,
    limit: 24,
  });

  // Next three months as month filter options
  const now = new Date();
  const months = [0, 1, 2].map((i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const pill = (active: boolean) =>
    [
      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all",
      active
        ? "bg-[#003118] text-white shadow-sm"
        : "border border-[#e0dfcf] bg-white text-[#003118] hover:border-[#003118]/30",
    ].join(" ");

  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Upcoming events
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4a4a45]">
          Grab a ticket, bring a friend, come as you are.
        </p>

        {/* Filters */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#96968e]">
              City
            </span>
            <Link
              href={buildUrl({ month, q })}
              className={pill(!city)}
            >
              All cities
            </Link>
            {site.cities.map((c) => (
              <Link
                key={c}
                href={buildUrl({ city: c, month, q })}
                className={pill(city === c)}
              >
                {c}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#96968e]">
              Month
            </span>
            <Link href={buildUrl({ city, q })} className={pill(!month)}>
              Any month
            </Link>
            {months.map((m) => (
              <Link
                key={m}
                href={buildUrl({ city, month: m, q })}
                className={pill(month === m)}
              >
                {monthLabel(m)}
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mt-10">
          {result.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-md rounded-3xl bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-[#003118]">
                Nothing booked here yet.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#575750]">
                Leave your email and we'll tell you first.
              </p>
              <NotifyForm
                kind="updates"
                city={city}
                buttonLabel="Tell me first"
                successMessage="Done. We'll tell you first."
                className="mt-5"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
