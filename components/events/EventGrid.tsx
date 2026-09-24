import { EventSummary } from "@/features/events/types";
import { EventCard } from "./EventCard";

export function EventGrid({ events }: { events: EventSummary[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-(--border) bg-white p-10 text-center">
        <h3 className="text-(--text-primary) font-semibold">
          No events here yet
        </h3>
        <p className="text-(--text-muted) mt-1">
          We’re always adding new experiences. Try another search or check back
          soon.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
