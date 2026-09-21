import { getFeaturedEvents } from "@/features/events/server";
import { EventGrid } from "./EventGrid";

export async function FeaturedEvents() {
  const events = await getFeaturedEvents();
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-[#171717] text-xl font-semibold mb-6">
        Featured Events
      </h2>
      <EventGrid events={events} />
    </section>
  );
}
