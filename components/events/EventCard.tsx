import Image from "next/image";
import Link from "next/link";
import { EventSummary } from "@/features/events/types";

export function EventCard({ event }: { event: EventSummary }) {
  const date = new Date(event.startsAt);
  const dateFmt = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group rounded-xl border border-[#E8E8E5] bg-white overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="relative aspect-4/3 bg-[#F3F3F0]">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[#6B6B6B]">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-[#171717] text-base font-semibold line-clamp-2">
          {event.name}
        </h3>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {dateFmt}
          {event.venueName ? ` · ${event.venueName}` : ""}
        </p>
        {event.fromPrice != null && (
          <p className="mt-2 text-sm font-medium text-[#171717]">
            From ₦{(event.fromPrice / 100).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}
