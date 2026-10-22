"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatEventDate } from "@/lib/format";

type NextEvent = { slug: string; startsAt: string };

// Pages where the sticky bar should not appear.
const EXCLUDED = ["/admin", "/payment", "/tickets", "/business"];

// Mobile-only sticky "Next event · Get Tickets" bar shown site-wide.
export function StickyTicketsBar() {
  const pathname = usePathname();
  const [event, setEvent] = useState<NextEvent | null>(null);

  const excluded = EXCLUDED.some((p) => pathname?.startsWith(p));
  // On an event page the page itself owns the mobile CTA — don't double up.
  const isEventPage = /^\/events\/[^/]+$/.test(pathname ?? "");

  useEffect(() => {
    if (excluded || isEventPage) return;
    let cancelled = false;
    fetch("/api/v1/events?limit=1")
      .then((r) => r.json())
      .then((d) => {
        const item = d?.data?.items?.[0];
        if (!cancelled && item) {
          setEvent({ slug: item.slug, startsAt: item.startsAt });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excluded, isEventPage]);

  if (excluded || isEventPage || !event) return null;

  return (
    <>
      {/* spacer so the fixed bar never covers form submit buttons */}
      <div className="h-16 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#003118]/10 bg-[#fffedd]/95 px-4 py-2.5 backdrop-blur md:hidden">
        <p className="text-xs font-semibold text-[#003118]">
          Next event: {formatEventDate(event.startsAt)}
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="btn btn-orange shrink-0 !min-h-0 px-4 py-2 text-xs"
        >
          Get Tickets
        </Link>
      </div>
    </>
  );
}
