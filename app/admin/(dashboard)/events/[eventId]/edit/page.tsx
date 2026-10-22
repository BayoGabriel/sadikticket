import { notFound } from "next/navigation";
import { PageHeader, Breadcrumbs } from "@/components/admin/ui/PageHeader";
import { EventForm, type EventFormInitial } from "@/components/admin/events/EventForm";
import { eventService } from "@/services/eventService";
import { settingsService } from "@/services/settingsService";
import { connectDb } from "@/lib/db";
import { FaqModel } from "@/models/faq";
import { TicketTypeModel } from "@/models/ticketType";
import { faqs as fallbackFaqs } from "@/lib/faqs";

export const dynamic = "force-dynamic";

// Convert a stored Date to date/time input strings in Africa/Lagos.
function toLagos(d?: Date | null) {
  if (!d) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  await connectDb();
  const [event, ticketTypes, dbFaqs, settings] = await Promise.all([
    eventService.getById(eventId).catch(() => null),
    TicketTypeModel.find({ eventId }).sort({ createdAt: 1 }).lean(),
    FaqModel.find({ published: true }).sort({ order: 1 }).lean().catch(() => []),
    settingsService.getPublic().catch(() => ({ cities: ["Lagos", "Benin City"] })),
  ]);
  if (!event) notFound();

  const start = toLagos(event.startsAt);
  const end = toLagos(event.endsAt);
  const doors = toLagos(event.doorsOpenAt);

  const initial: EventFormInitial = {
    name: event.name,
    slug: event.slug,
    shortDescription: event.shortDescription ?? "",
    eventType: event.eventType ?? "",
    tags: event.tags ?? [],
    date: start.date,
    startTime: start.time,
    endTime: end.time,
    doorsOpenTime: doors.time,
    city: event.city ?? "Lagos",
    venueName: event.venueName ?? "",
    venueAddress: event.venueAddress ?? "",
    directions: event.directions ?? "",
    mapLink: event.mapLink ?? "",
    mapImage: event.mapImage ?? "",
    coverImage: event.coverImage ?? "",
    coverImageAlt: event.coverImageAlt ?? "",
    gallery: event.gallery ?? [],
    description: event.description ?? "",
    includes: event.includes ?? [],
    ticketTypes: ticketTypes.map((t) => ({
      id: String(t._id),
      name: t.name,
      priceNaira: t.price / 100,
      quantity: t.quantity,
      maxPerOrder: t.maxPerOrder ?? null,
      salesStart: t.salesStart ? new Date(t.salesStart).toISOString().slice(0, 16) : null,
      salesEnd: t.salesEnd ? new Date(t.salesEnd).toISOString().slice(0, 16) : null,
      status: t.status,
    })),
    ageLimit: event.goodToKnow?.ageLimit ?? "",
    whatToWear: event.goodToKnow?.whatToWear ?? "",
    runningLate: event.goodToKnow?.runningLate ?? "",
    faqIds: (event.faqIds ?? []).map(String),
    checkoutQuestionText: event.checkoutQuestion?.text ?? "What's your preferred experience?",
    checkoutQuestionRequired: event.checkoutQuestion?.required ?? false,
    checkoutQuestionOptions: (event.checkoutQuestion?.options ?? []).join(", "),
    visibility: event.status === "PUBLISHED" ? "publish" : "draft",
    scheduledPublishAt: event.scheduledPublishAt
      ? new Date(event.scheduledPublishAt).toISOString().slice(0, 16)
      : "",
    statusOverride: event.statusOverride ?? "",
    fewLeftThreshold: event.fewLeftThreshold != null ? String(event.fewLeftThreshold) : "",
    status: event.status,
  };

  const faqs = dbFaqs.length
    ? dbFaqs.map((f) => ({ id: String(f._id), question: f.question }))
    : fallbackFaqs.map((f) => ({ id: f.id, question: f.q }));

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/admin/events" },
          { label: event.name, href: `/admin/events/${eventId}` },
          { label: "Edit" },
        ]}
      />
      <PageHeader title={`Edit “${event.name}”`} subtitle="Changes save as drafts automatically. Publish when it's ready." />
      <EventForm eventId={eventId} initial={initial} faqs={faqs} cities={settings.cities ?? ["Lagos", "Benin City"]} />
    </div>
  );
}
