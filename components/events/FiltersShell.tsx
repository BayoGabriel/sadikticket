"use client";
import { useState, useTransition } from "react";
import { fetchEvents as fetchEventsClient } from "@/features/events/api";
import { EventGrid as GridClient } from "@/components/events/EventGrid";
import { EventFilters } from "@/components/events/EventFilters";

export function FiltersShell({ initialEvents }: { initialEvents: any[] }) {
  const [range, setRange] = useState<undefined | "today" | "week" | "month">();
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [loading, startTransition] = useTransition();

  const onChange = (v?: "today" | "week" | "month") => {
    setRange(v);
    startTransition(async () => {
      try {
        const data = await fetchEventsClient({ range: v, limit: 9 });
        setEvents(data.items);
      } catch {
        setEvents([]);
      }
    });
  };

  return (
    <div className="w-full">
      <EventFilters value={range} onChange={onChange} />
      <div className="mt-6">
        {loading ? (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-live="polite"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E8E8E5] bg-white overflow-hidden"
              >
                <div className="bg-[#F3F3F0] aspect-4/3 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#F3F3F0] rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-[#F3F3F0] rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <GridClient events={events} />
        )}
      </div>
    </div>
  );
}
