import Link from 'next/link';
import { EventStatusBadge } from './EventStatusBadge';

export function EventHeader({ event }: { event: any }) {
  const date = event.startsAt ? new Date(event.startsAt) : null;
  const publicUrl = event.slug ? `${process.env.APP_URL || ''}/events/${event.slug}` : null;
  return (
    <div className="rounded-2xl bg-white border border-[#E8E8E5] overflow-hidden">
      <div className="p-6 border-b border-[#E8E8E5] flex items-start justify-between gap-4">
        <div>
          <div className="text-sm"><Link href="/admin/events" className="text-[#6B6B6B] hover:underline">← Back to events</Link></div>
          <h1 className="mt-2 text-2xl font-semibold text-[#171717] flex items-center gap-3">
            {event.name}
            <EventStatusBadge status={event.status} />
          </h1>
          <div className="mt-2 text-[#6B6B6B]">
            {date && <div>{date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
            {(event.city || event.country) && <div>{[event.city, event.state, event.country].filter(Boolean).join(', ')}</div>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicUrl && (
            <Link href={publicUrl} target="_blank" className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0]">View public event</Link>
          )}
          <Link href={`/admin/events/${event.id}/edit`} className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0]">Edit event</Link>
        </div>
      </div>
      {event.coverImage ? (
        <div className="relative aspect-4/3 bg-[#F3F3F0]"></div>
      ) : null}
    </div>
  );
}
