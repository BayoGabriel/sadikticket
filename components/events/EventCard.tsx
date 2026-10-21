import Image from "next/image";
import Link from "next/link";
import { EventSummary, EventStatusTag } from "@/features/events/types";

const tagStyles: Record<EventStatusTag, { label: string; cls: string }> = {
  "on-sale": {
    label: "Tickets on sale",
    cls: "bg-[#003118] text-white",
  },
  "few-left": {
    label: "Few tickets left",
    cls: "bg-[#f27a00] text-white",
  },
  "sold-out": {
    label: "Sold out",
    cls: "bg-[#3d3d38] text-white",
  },
  "coming-soon": {
    label: "Coming soon",
    cls: "bg-white/90 text-[#003118]",
  },
};

export function EventCard({ event }: { event: EventSummary }) {
  const date = new Date(event.startsAt);
  const dateFmt = date.toLocaleString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const tag = tagStyles[event.statusTag ?? "on-sale"];
  const soldOut = event.statusTag === "sold-out";

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-4/3 overflow-hidden"
      >
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
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#003118] via-[#0a4a2c] to-[#f27a00]/60 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            Photo · {event.name}
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${tag.cls}`}
        >
          {tag.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-[#8a8a7d]">
          {dateFmt}
          {event.city ? `  ·  ${event.city}` : ""}
        </div>

        <Link href={`/events/${event.slug}`}>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-[#003118] transition group-hover:text-[#f27a00]">
            {event.name}
          </h3>
        </Link>

        {event.venueName && (
          <div className="mt-0.5 text-sm text-[#8a8a7d]">{event.venueName}</div>
        )}

        {event.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#575750]">
            {event.shortDescription}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-sm font-semibold text-[#003118]">
            {event.fromPrice != null
              ? `From ₦${(event.fromPrice / 100).toLocaleString()}`
              : ""}
          </div>
          <Link
            href={`/events/${event.slug}${soldOut ? "#tickets" : ""}`}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
              soldOut
                ? "border border-[#003118]/25 text-[#003118] hover:bg-[#e6eeeb]"
                : "bg-[#f27a00] text-white hover:bg-[#d56c00]"
            }`}
          >
            {soldOut ? "Join the waitlist" : "Get Tickets"}
          </Link>
        </div>
      </div>
    </div>
  );
}
