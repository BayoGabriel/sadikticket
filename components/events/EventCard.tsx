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
      className="group block rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition will-change-transform"
    >
      <div className="relative aspect-4/3 rounded-3xl overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            style={{ height: "100%", width: "100%" }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-(--surface-muted) text-(--text-muted)">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 text-white text-xs">
            {event.city && (
              <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur px-2 py-0.5">
                {event.city}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur px-2 py-0.5">
              {dateFmt}
            </span>
          </div>
          <h3 className="mt-2 text-white text-lg font-semibold drop-shadow line-clamp-2">
            {event.name}
          </h3>
        </div>
      </div>
      <div className="px-1 pt-2 flex items-center justify-between">
        <div className="text-sm text-(--text-muted)">
          {event.venueName || ""}
        </div>
        {event.fromPrice != null && (
          <div className="text-sm font-medium text-(--text-primary)">
            From ₦{(event.fromPrice / 100).toLocaleString()}
          </div>
        )}
      </div>
    </Link>
  );
}
