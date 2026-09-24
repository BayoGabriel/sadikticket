import { notFound } from "next/navigation";
import { getEvent } from "@/features/admin/events/api";
import { EventHeader } from "@/features/admin/events/components/EventHeader";
import { EventActions } from "@/features/admin/events/components/EventActions";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const ev = await (async () => {
    try {
      return await getEvent(eventId);
    } catch {
      return null;
    }
  })();
  if (!ev) return notFound();

  return (
    <div className="space-y-6">
      <EventHeader event={ev} />

      <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Overview</h2>
          <EventActions eventId={ev.id} status={ev.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metrics: show only placeholders for now since backend doesn't expose counts here */}
          <div className="rounded-xl border border-[#E8E8E5] p-4">
            <div className="text-sm text-[#6B6B6B]">Status</div>
            <div className="mt-1 font-medium">{ev.status}</div>
          </div>
          {ev.capacity != null && (
            <div className="rounded-xl border border-[#E8E8E5] p-4">
              <div className="text-sm text-[#6B6B6B]">Capacity</div>
              <div className="mt-1 font-medium">{ev.capacity}</div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
        <h3 className="font-semibold">Event information</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[#6B6B6B]">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap">
              {ev.description || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[#6B6B6B]">When</dt>
            <dd className="mt-1">
              {ev.startsAt ? new Date(ev.startsAt).toLocaleString() : "—"}
              {ev.endsAt ? ` → ${new Date(ev.endsAt).toLocaleString()}` : ""}
              {ev.timezone ? ` (${ev.timezone})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[#6B6B6B]">Location</dt>
            <dd className="mt-1">
              {[ev.venueName, ev.venueAddress, ev.city, ev.state, ev.country]
                .filter(Boolean)
                .join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[#6B6B6B]">Public URL</dt>
            <dd className="mt-1">
              {ev.slug ? (
                <a
                  className="text-emerald-700 hover:underline"
                  href={`/events/${ev.slug}`}
                  target="_blank"
                >
                  /events/{ev.slug}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
