import Image from "next/image";
import Link from "next/link";
import { EventSummary, EventStatusTag } from "@/features/events/types";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { formatEventDate, formatEventTime, formatNaira } from "@/lib/format";

const tagStyles: Record<EventStatusTag, { label: string; cls: string }> = {
  "on-sale": { label: "Tickets on sale", cls: "bg-[#003118] text-[#fffedd]" },
  "few-left": { label: "Few tickets left", cls: "bg-[#f27a00] text-[#003118]" },
  "sold-out": { label: "Sold out", cls: "bg-[#3d3d38] text-white" },
  "coming-soon": { label: "Coming soon", cls: "bg-white/95 text-[#003118]" },
};

export function EventCard({ event }: { event: EventSummary }) {
  const tag = tagStyles[event.statusTag ?? "on-sale"];
  const soldOut = event.statusTag === "sold-out";

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/events/${event.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <Img image={images.eventFallback} className="absolute inset-0 !aspect-auto" />
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${tag.cls}`}
        >
          {tag.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-[#8a8a7d]">
          {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
        </div>

        <Link href={`/events/${event.slug}`}>
          <h3 className="mt-1.5 font-display text-lg font-semibold tracking-tight text-[#003118] transition group-hover:text-[#f27a00]">
            {event.name}
          </h3>
        </Link>

        <div className="mt-0.5 text-sm text-[#8a8a7d]">
          {[event.city, event.venueName].filter(Boolean).join(" · ")}
        </div>

        {event.shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#575750]">
            {event.shortDescription}
          </p>
        )}

        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-[#e7efe9] px-2.5 py-0.5 text-[11px] font-medium text-[#003118]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="text-sm font-semibold text-[#003118]">
            {event.fromPrice != null ? `From ${formatNaira(event.fromPrice)}` : ""}
          </div>
          <Link
            href={`/events/${event.slug}${soldOut ? "#tickets" : ""}`}
            className={`btn !min-h-0 px-4 py-2 text-sm ${
              soldOut ? "btn-outline" : "btn-orange"
            }`}
          >
            {soldOut ? "Join the waitlist" : "Get Tickets"}
          </Link>
        </div>
      </div>
    </div>
  );
}
