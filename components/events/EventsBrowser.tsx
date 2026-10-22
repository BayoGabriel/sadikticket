"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { NotifyForm } from "@/components/forms/NotifyForm";
import { siteConfig } from "@/lib/site-config";
import type { EventSummary } from "@/features/events/types";

const TAG_FILTERS = [
  { value: "evening", label: "Evening" },
  { value: "outdoor", label: "Outdoor" },
  { value: "beginner-friendly", label: "Beginner-friendly" },
  { value: "good-for-groups", label: "Good for groups" },
];

const TYPE_FILTERS = [
  { value: "painting", label: "Painting" },
  { value: "karaoke", label: "Karaoke" },
  { value: "picnic", label: "Picnic" },
  { value: "pottery", label: "Pottery" },
  { value: "beach", label: "Beach" },
];

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
  const tag = sp.get("tag") ?? "";
  const type = sp.get("type") ?? "";

  const [items, setItems] = useState<EventSummary[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const first = useRef(true);

  // Flip back to "loading" the moment filters change (before the fetch fires).
  const filterKey = `${city}|${month}|${tag}|${type}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setLoading(true);
  }

  // Keep the URL shareable — replace, don't reload.
  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname],
  );

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (month) q.set("month", month);
    if (tag) q.set("tag", tag);
    if (type) q.set("type", type);
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
  }, [city, month, tag, type]);

  // Skip scroll-to-top on first paint.
  useEffect(() => {
    first.current = false;
  }, []);

  return (
    <div>
      {/* City */}
      {!lockedCity && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by city">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a8a7d]">
            City
          </span>
          <Pill active={!city} onClick={() => setParam("city", "")}>
            All cities
          </Pill>
          {siteConfig.cities.map((c) => (
            <Pill key={c} active={city === c} onClick={() => setParam("city", city === c ? "" : c)}>
              {c}
            </Pill>
          ))}
        </div>
      )}

      {/* Month — only months that actually have events */}
      {months.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by month">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.14em] text-[#8a8a7d]">
            Month
          </span>
          <Pill active={!month} onClick={() => setParam("month", "")}>
            Any month
          </Pill>
          {months.map((m) => (
            <Pill key={m} active={month === m} onClick={() => setParam("month", month === m ? "" : m)}>
              {monthLabel(m)}
            </Pill>
          ))}
        </div>
      )}

      {/* Tags + types */}
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by vibe">
        {TAG_FILTERS.map((t) => (
          <Pill key={t.value} active={tag === t.value} onClick={() => setParam("tag", tag === t.value ? "" : t.value)}>
            {t.label}
          </Pill>
        ))}
        <span className="mx-1 h-5 w-px bg-[#003118]/15" aria-hidden />
        {TYPE_FILTERS.map((t) => (
          <Pill key={t.value} active={type === t.value} onClick={() => setParam("type", type === t.value ? "" : t.value)}>
            {t.label}
          </Pill>
        ))}
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
