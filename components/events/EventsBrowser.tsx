"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { NotifyForm } from "@/components/forms/NotifyForm";
import { siteConfig } from "@/lib/site-config";
import type { EventSummary } from "@/features/events/types";

// The next N months as YYYY-MM — the filter always offers at least 3 months
// upfront even before events are published in them.
function upcomingMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#003118] text-[#fffedd]"
          : "bg-white text-[#003118] ring-1 ring-[#003118]/15 hover:ring-[#003118]/40"
      }`}
    >
      {children}
    </button>
  );
}

export function EventsBrowser({ lockedCity }: { lockedCity?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const city = lockedCity ?? sp.get("city") ?? "";
  const month = sp.get("month") ?? "";
  const date = sp.get("date") ?? "";

  const [items, setItems] = useState<EventSummary[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  // Flip back to "loading" the moment filters change (before the fetch fires).
  const filterKey = `${city}|${month}|${date}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setLoading(true);
  }

  // Keep the URL shareable — replace, don't reload. Applies several param
  // changes in one update (e.g. picking a date clears the month filter).
  const setParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (month) q.set("month", month);
    if (date) q.set("date", date);
    q.set("limit", "48");
    fetch(`/api/v1/events?${q.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(d?.data?.items ?? []);
        setMonths(d?.data?.months ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city, month, date]);

  // Skip scroll-to-top on first paint.
  useEffect(() => {
    first.current = false;
  }, []);

  // Always offer the next 3 months upfront, plus any later months that
  // actually have events.
  const monthOptions = [
    ...new Set([...upcomingMonths(3), ...months]),
  ].sort();
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  return (
    <div>
      {/* City */}
      {!lockedCity && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by city">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a8a7d]">
            City
          </span>
          <Pill active={!city} onClick={() => setParams({ city: "" })}>
            All cities
          </Pill>
          {siteConfig.cities.map((c) => (
            <Pill key={c} active={city === c} onClick={() => setParams({ city: city === c ? "" : c })}>
              {c}
            </Pill>
          ))}
        </div>
      )}

      {/* Month — at least 3 months upfront, plus any months that have events */}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by month">
        <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a8a7d]">
          Month
        </span>
        <Pill
          active={!month && !date}
          onClick={() => setParams({ month: "", date: "" })}
        >
          Any month
        </Pill>
        {monthOptions.map((m) => (
          <Pill
            key={m}
            active={month === m}
            onClick={() =>
              setParams({ month: month === m ? "" : m, date: "" })
            }
          >
            {monthLabel(m)}
          </Pill>
        ))}
      </div>

      {/* Pick a date — calendar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label
          htmlFor="event-date"
          className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a8a7d]"
        >
          Pick a date
        </label>
        <input
          id="event-date"
          type="date"
          value={date}
          min={todayStr}
          onChange={(e) =>
            setParams({ date: e.target.value, month: "" })
          }
          className="min-h-11 rounded-full border-0 bg-white px-4 py-2 text-sm font-semibold text-[#003118] ring-1 ring-[#003118]/15 transition focus:ring-2 focus:ring-[#003118]/40"
        />
        {date && (
          <button
            type="button"
            onClick={() => setParams({ date: "" })}
            className="text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-[#e7efe9]" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="mt-10 max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h3 className="font-display text-xl font-semibold text-[#003118]">
            Nothing booked here yet.
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#575750]">
            Leave your email and we&rsquo;ll tell you first.
          </p>
          <NotifyForm
            kind="updates"
            city={city || undefined}
            buttonLabel="Tell me first"
            successMessage="Done. You'll hear from us first."
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
}
