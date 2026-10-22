"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slugify";
import { EventCard } from "@/components/events/EventCard";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { ChipInput } from "@/components/admin/forms/ChipInput";
import { ImageField } from "@/components/admin/forms/ImageField";
import { Icon } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { formatNaira } from "@/lib/format";

// ── Form shape (split date/time + price in naira for humans) ────────────────
const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Every ticket needs a name."),
  priceNaira: z.coerce.number().min(0, "Price can't be negative."),
  quantity: z.coerce.number().int().min(0, "Give it a capacity, even a big one."),
  maxPerOrder: z.coerce.number().int().min(1).nullable().optional(),
  salesStart: z.string().nullable().optional(),
  salesEnd: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  remove: z.boolean().optional(),
});

const formSchema = z.object({
  name: z.string().min(3, "Give it a name people will recognise."),
  slug: z.string().regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only."),
  shortDescription: z.string().max(100, "Keep the hook under 100 characters."),
  eventType: z.string(),
  tags: z.array(z.string()),
  date: z.string().min(1, "Pick a date."),
  startTime: z.string().min(1, "Pick a start time."),
  endTime: z.string().min(1, "Pick an end time."),
  doorsOpenTime: z.string(),
  city: z.string().min(1, "Pick a city."),
  venueName: z.string().min(1, "Where is it? A venue name helps people say yes."),
  venueAddress: z.string(),
  directions: z.string(),
  mapLink: z.string(),
  mapImage: z.string(),
  coverImage: z.string(),
  coverImageAlt: z.string(),
  gallery: z.array(z.string()),
  description: z.string(),
  includes: z.array(z.string()),
  ticketTypes: z.array(ticketTypeSchema),
  ageLimit: z.string(),
  whatToWear: z.string(),
  runningLate: z.string(),
  faqIds: z.array(z.string()),
  checkoutQuestionText: z.string(),
  checkoutQuestionRequired: z.boolean(),
  checkoutQuestionOptions: z.string(), // comma separated
  visibility: z.enum(["draft", "publish", "schedule"]),
  scheduledPublishAt: z.string(),
  statusOverride: z.enum(["", "on-sale", "few-left", "sold-out", "coming-soon"]),
  fewLeftThreshold: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export type EventFormInitial = Partial<FormValues> & { id?: string; status?: string };

const SECTIONS = [
  { id: "basics", label: "Basics" },
  { id: "when", label: "When" },
  { id: "where", label: "Where" },
  { id: "photos", label: "Photos" },
  { id: "about", label: "About" },
  { id: "included", label: "What's included" },
  { id: "tickets", label: "Tickets" },
  { id: "goodtoknow", label: "Good to know" },
  { id: "faqs", label: "FAQs" },
  { id: "checkout", label: "Checkout question" },
  { id: "visibility", label: "Visibility" },
];

function toLagosIso(date: string, time: string) {
  if (!date || !time) return null;
  // Africa/Lagos is always UTC+1, no DST — safe to pin the offset.
  return new Date(`${date}T${time}:00+01:00`).toISOString();
}

export function EventForm({
  eventId,
  initial,
  faqs,
  cities,
}: {
  eventId?: string;
  initial: EventFormInitial;
  faqs: { id: string; question: string }[];
  cities: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [savedId, setSavedId] = useState<string | undefined>(eventId);
  const [eventStatus, setEventStatus] = useState(initial.status ?? "DRAFT");
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [activeSection, setActiveSection] = useState("basics");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"card" | "hero">("card");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastSavedJson = useRef<string>("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      eventType: "",
      tags: [],
      date: "",
      startTime: "18:00",
      endTime: "21:00",
      doorsOpenTime: "",
      city: cities[0] ?? "Lagos",
      venueName: "",
      venueAddress: "",
      directions: "",
      mapLink: "",
      mapImage: "",
      coverImage: "",
      coverImageAlt: "",
      gallery: [],
      description: "",
      includes: [],
      ticketTypes: [
        { name: "Single", priceNaira: 15000, quantity: 50, status: "ACTIVE" },
      ],
      ageLimit: "",
      whatToWear: "",
      runningLate: "",
      faqIds: [],
      checkoutQuestionText: "What's your preferred experience?",
      checkoutQuestionRequired: false,
      checkoutQuestionOptions: "",
      visibility: "draft",
      scheduledPublishAt: "",
      statusOverride: "",
      fewLeftThreshold: "",
      ...initial,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "ticketTypes" });
  const values = watch();
  const slugTouched = useRef(!!initial.slug);

  // Auto-slug from name until the user edits it.
  const name = watch("name");
  useEffect(() => {
    if (!slugTouched.current)
      setValue("slug", slugify(name || "", { lower: true, strict: true }));
  }, [name, setValue]);

  function buildPayload(v: FormValues) {
    return {
      name: v.name,
      slug: v.slug || undefined,
      shortDescription: v.shortDescription || undefined,
      description: v.description || undefined,
      coverImage: v.coverImage || undefined,
      coverImageAlt: v.coverImageAlt || undefined,
      includes: v.includes,
      tags: v.tags,
      eventType: v.eventType || undefined,
      directions: v.directions || undefined,
      mapLink: v.mapLink || undefined,
      mapImage: v.mapImage || undefined,
      gallery: v.gallery,
      faqIds: v.faqIds,
      statusOverride: v.statusOverride || null,
      venueName: v.venueName,
      venueAddress: v.venueAddress || "—",
      city: v.city,
      country: "Nigeria",
      startsAt: toLagosIso(v.date, v.startTime),
      endsAt: toLagosIso(v.date, v.endTime),
      doorsOpenAt: v.doorsOpenTime ? toLagosIso(v.date, v.doorsOpenTime) : null,
      timezone: "Africa/Lagos",
      capacity: v.ticketTypes.filter((t) => !t.remove).reduce((a, t) => a + (Number(t.quantity) || 0), 0),
      scheduledPublishAt:
        v.visibility === "schedule" && v.scheduledPublishAt
          ? new Date(v.scheduledPublishAt).toISOString()
          : null,
      fewLeftThreshold: v.fewLeftThreshold ? Number(v.fewLeftThreshold) : null,
      checkoutQuestion: v.checkoutQuestionText
        ? {
            text: v.checkoutQuestionText,
            required: v.checkoutQuestionRequired,
            options: v.checkoutQuestionOptions.split(",").map((s) => s.trim()).filter(Boolean),
          }
        : null,
      goodToKnow: { ageLimit: v.ageLimit, whatToWear: v.whatToWear, runningLate: v.runningLate },
      status:
        v.visibility === "publish" ? "PUBLISHED" : "DRAFT",
      ticketTypes: v.ticketTypes.map((t) => ({
        id: t.id,
        name: t.name,
        priceNaira: Number(t.priceNaira),
        quantity: Number(t.quantity),
        maxPerOrder: t.maxPerOrder ? Number(t.maxPerOrder) : null,
        salesStart: t.salesStart || null,
        salesEnd: t.salesEnd || null,
        status: t.status,
        remove: t.remove,
      })),
    };
  }

  async function save(v: FormValues, opts?: { silent?: boolean }) {
    const payload = buildPayload(v);
    const json = JSON.stringify(payload);
    if (opts?.silent && json === lastSavedJson.current) return; // nothing changed
    const res = await fetch(
      savedId ? `/api/v1/admin/events/${savedId}` : "/api/v1/admin/events",
      {
        method: savedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      },
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Couldn't save");
    if (!savedId) setSavedId(data.data.id);
    lastSavedJson.current = json;
    return data.data;
  }

  // Autosave: once the event exists, quietly save drafts as they type.
  useEffect(() => {
    if (!savedId || eventStatus !== "DRAFT") return;
    const sub = watch((v, { type }) => {
      if (type !== "change") return;
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(async () => {
        try {
          setSaving("saving");
          await save(v as FormValues, { silent: true });
          setSaving("saved");
          setTimeout(() => setSaving("idle"), 2000);
        } catch {
          setSaving("idle");
        }
      }, 2500);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedId, eventStatus]);

  async function onSubmit(v: FormValues) {
    try {
      const data = await save(v);
      const status = v.visibility === "publish" ? "PUBLISHED" : "DRAFT";
      setEventStatus(status);
      toast(status === "PUBLISHED" ? "It's live — on the site right now." : "Draft saved.", {
        actionLabel: status === "PUBLISHED" ? "View it" : undefined,
        onAction: status === "PUBLISHED" ? () => window.open(`/events/${data.slug}`, "_blank") : undefined,
      });
      if (!eventId) router.push(`/admin/events/${data.id}/edit`);
      else router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    }
  }

  // Publish checklist
  const checklist = useMemo(() => {
    const live = values.ticketTypes?.filter((t) => !t.remove) ?? [];
    return [
      { ok: !!values.name && values.name.length >= 3, label: "A name" },
      { ok: !!values.date, label: "A date" },
      { ok: !!values.city, label: "A city" },
      { ok: !!values.venueName, label: "A venue" },
      { ok: !!values.coverImage, label: "A hero photo" },
      { ok: live.length > 0 && live.every((t) => t.name && t.quantity > 0), label: "At least one ticket type" },
    ];
  }, [values]);
  const ready = checklist.every((c) => c.ok);
  const totalCapacity = values.ticketTypes?.filter((t) => !t.remove).reduce((a, t) => a + (Number(t.quantity) || 0), 0) ?? 0;

  // Live preview event summary in the public card shape.
  const previewEvent = {
    id: savedId ?? "preview",
    slug: values.slug || "preview",
    name: values.name || "Your event name",
    startsAt: toLagosIso(values.date || new Date().toISOString().slice(0, 10), values.startTime || "18:00") ?? new Date().toISOString(),
    endsAt: toLagosIso(values.date || new Date().toISOString().slice(0, 10), values.endTime || "21:00") ?? new Date().toISOString(),
    city: values.city,
    venueName: values.venueName,
    shortDescription: values.shortDescription,
    coverImage: values.coverImage || undefined,
    tags: values.tags,
    statusTag: (values.statusOverride || "on-sale") as "on-sale",
    fromPrice: values.ticketTypes?.length
      ? Math.min(...values.ticketTypes.filter((t) => !t.remove).map((t) => Number(t.priceNaira) * 100))
      : null,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6 md:grid-cols-[140px_1fr]">
          {/* Sticky section nav */}
          <nav className="sticky top-16 hidden self-start space-y-0.5 md:block" aria-label="Form sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className="block rounded-lg px-2.5 py-1.5 text-xs font-bold"
                style={{
                  color: activeSection === s.id ? "var(--green)" : "var(--admin-ink-soft)",
                  background: activeSection === s.id ? "var(--mint)" : "transparent",
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* Sections */}
          <div className="min-w-0 space-y-5">
            <section id="basics" className="a-card p-5" onFocusCapture={() => setActiveSection("basics")}>
              <h2 className="admin-title mb-4 text-base font-bold">Basics</h2>
              <div className="space-y-4">
                <Field label="Event name" htmlFor="f-name" required error={errors.name?.message}>
                  <input id="f-name" className="a-input" placeholder="Sip and Paint Night" {...register("name")} aria-invalid={!!errors.name} />
                </Field>
                <Field label="Web address (slug)" htmlFor="f-slug" hint="serenart.ng/events/your-slug" error={errors.slug?.message}>
                  <input id="f-slug" className="a-input font-mono text-sm" {...register("slug")} onChange={(e) => { slugTouched.current = true; setValue("slug", e.target.value); }} aria-invalid={!!errors.slug} />
                </Field>
                <Field label="One-line hook" htmlFor="f-hook" hint={`${values.shortDescription?.length ?? 0}/100 — the line under the name.`} error={errors.shortDescription?.message}>
                  <input id="f-hook" className="a-input" placeholder="Paint, sip and laugh the night away." {...register("shortDescription")} aria-invalid={!!errors.shortDescription} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Event type" htmlFor="f-type" hint="painting, karaoke, picnic, pottery…">
                    <input id="f-type" className="a-input" list="event-types" {...register("eventType")} />
                    <datalist id="event-types">
                      {["painting", "karaoke", "picnic", "pottery", "rnb", "games", "beach", "retreat", "social"].map((t) => <option key={t} value={t} />)}
                    </datalist>
                  </Field>
                  <Field label="Tags" htmlFor="f-tags">
                    <Controller
                      control={control}
                      name="tags"
                      render={({ field }) => (
                        <ChipInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add a tag…"
                          label="Tags"
                          suggestions={["evening", "outdoor", "beginner-friendly", "good for groups"]}
                        />
                      )}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section id="when" className="a-card p-5" onFocusCapture={() => setActiveSection("when")}>
              <h2 className="admin-title mb-4 text-base font-bold">When</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" htmlFor="f-date" required error={errors.date?.message}>
                  <input id="f-date" type="date" className="a-input" {...register("date")} aria-invalid={!!errors.date} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Starts" htmlFor="f-start" required error={errors.startTime?.message}>
                    <input id="f-start" type="time" className="a-input" {...register("startTime")} aria-invalid={!!errors.startTime} />
                  </Field>
                  <Field label="Ends" htmlFor="f-end" required error={errors.endTime?.message}>
                    <input id="f-end" type="time" className="a-input" {...register("endTime")} aria-invalid={!!errors.endTime} />
                  </Field>
                </div>
                <Field label="Doors open" htmlFor="f-doors" hint="Optional — e.g. 30 minutes before.">
                  <input id="f-doors" type="time" className="a-input" {...register("doorsOpenTime")} />
                </Field>
                <Field label="Timezone">
                  <input className="a-input" value="Africa/Lagos (WAT)" disabled aria-label="Timezone" />
                </Field>
              </div>
            </section>

            <section id="where" className="a-card p-5" onFocusCapture={() => setActiveSection("where")}>
              <h2 className="admin-title mb-4 text-base font-bold">Where</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" htmlFor="f-city" required error={errors.city?.message}>
                  <select id="f-city" className="a-select" {...register("city")} aria-invalid={!!errors.city}>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Venue name" htmlFor="f-venue" required error={errors.venueName?.message}>
                  <input id="f-venue" className="a-input" placeholder="The Garden Rooftop" {...register("venueName")} aria-invalid={!!errors.venueName} />
                </Field>
              </div>
              <div className="mt-4 space-y-4">
                <Field label="Address" htmlFor="f-addr">
                  <input id="f-addr" className="a-input" placeholder="12 Admiralty Way, Lekki Phase 1" {...register("venueAddress")} />
                </Field>
                <Field label="How to get there" htmlFor="f-dir" hint="Parking, landmarks, what to look for — plain words help nervous first-timers.">
                  <textarea id="f-dir" className="a-textarea" {...register("directions")} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Google Maps link" htmlFor="f-map">
                    <input id="f-map" className="a-input" placeholder="https://maps.google.com/…" {...register("mapLink")} />
                  </Field>
                  <Field label="Map image" hint="Optional — a screenshot of the map.">
                    <Controller control={control} name="mapImage" render={({ field }) => <ImageField value={field.value} onChange={field.onChange} aspect="aspect-[16/9]" label="Map screenshot" />} />
                  </Field>
                </div>
              </div>
            </section>

            <section id="photos" className="a-card p-5" onFocusCapture={() => setActiveSection("photos")}>
              <h2 className="admin-title mb-4 text-base font-bold">Photos</h2>
              <Field label="Hero photo" required hint="The first thing people see — 4:3, bright, full of people having fun.">
                <Controller control={control} name="coverImage" render={({ field }) => <ImageField value={field.value} onChange={field.onChange} />} />
              </Field>
              <div className="mt-4">
                <Field label="Alt text" htmlFor="f-alt" hint="One line describing the photo, for screen readers and SEO.">
                  <input id="f-alt" className="a-input" placeholder="Guests painting canvases at a long table" {...register("coverImageAlt")} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Gallery photos" hint="More angles — they show under the hero.">
                  <Controller
                    control={control}
                    name="gallery"
                    render={({ field }) => (
                      <div>
                        <div className="grid grid-cols-3 gap-2">
                          {field.value.map((url, i) => (
                            <div key={i} className="relative aspect-square overflow-hidden rounded-xl" style={{ background: "var(--mint)" }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" className="h-full w-full object-cover" />
                              <button type="button" aria-label="Remove photo" className="a-btn a-btn-sm absolute right-1 top-1" style={{ background: "#fff", color: "var(--admin-red)", minHeight: 30, padding: "0.3rem" }} onClick={() => field.onChange(field.value.filter((_, j) => j !== i))}>
                                <Icon name="x" size={13} />
                              </button>
                            </div>
                          ))}
                          <div className="aspect-square">
                            <ImageField value="" onChange={(url) => field.onChange([...field.value, url])} aspect="aspect-square" label="+" />
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </Field>
              </div>
            </section>

            <section id="about" className="a-card p-5" onFocusCapture={() => setActiveSection("about")}>
              <h2 className="admin-title mb-4 text-base font-bold">About the event</h2>
              <Field label="Description" htmlFor="f-desc" hint="2–3 short paragraphs. What happens, why it's fun, who it's for.">
                <textarea id="f-desc" className="a-textarea" style={{ minHeight: 140 }} {...register("description")} />
              </Field>
            </section>

            <section id="included" className="a-card p-5" onFocusCapture={() => setActiveSection("included")}>
              <h2 className="admin-title mb-4 text-base font-bold">What's included</h2>
              <Controller
                control={control}
                name="includes"
                render={({ field }) => (
                  <ChipInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Canvas, paint, apron…"
                    label="What's included"
                    suggestions={["Canvas", "Paint and brushes", "Apron", "Drink", "Snack", "Photos of the night"]}
                  />
                )}
              />
            </section>

            <section id="tickets" className="a-card p-5" onFocusCapture={() => setActiveSection("tickets")}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="admin-title text-base font-bold">Tickets</h2>
                <span className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
                  Total capacity: {totalCapacity.toLocaleString()}
                </span>
              </div>
              <div className="space-y-3">
                {fields.map((f, i) =>
                  values.ticketTypes?.[i]?.remove ? null : (
                    <div key={f.id} className="a-card p-4" style={{ background: "var(--admin-canvas)" }}>
                      <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px]">
                        <Field label="Name" required error={errors.ticketTypes?.[i]?.name?.message}>
                          <input className="a-input" placeholder="Single" {...register(`ticketTypes.${i}.name`)} aria-invalid={!!errors.ticketTypes?.[i]?.name} />
                        </Field>
                        <Field label="Price (₦)" required error={errors.ticketTypes?.[i]?.priceNaira?.message}>
                          <input className="a-input" type="number" min={0} step={100} {...register(`ticketTypes.${i}.priceNaira`)} aria-invalid={!!errors.ticketTypes?.[i]?.priceNaira} />
                        </Field>
                        <Field label="Capacity" required error={errors.ticketTypes?.[i]?.quantity?.message}>
                          <input className="a-input" type="number" min={0} {...register(`ticketTypes.${i}.quantity`)} aria-invalid={!!errors.ticketTypes?.[i]?.quantity} />
                        </Field>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <Field label="Max per order" hint="Blank = no limit">
                          <input className="a-input" type="number" min={1} {...register(`ticketTypes.${i}.maxPerOrder`)} />
                        </Field>
                        <Field label="Sales start" hint="Optional">
                          <input className="a-input" type="datetime-local" {...register(`ticketTypes.${i}.salesStart`)} />
                        </Field>
                        <Field label="Sales end" hint="Optional">
                          <input className="a-input" type="datetime-local" {...register(`ticketTypes.${i}.salesEnd`)} />
                        </Field>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Controller
                          control={control}
                          name={`ticketTypes.${i}.status`}
                          render={({ field }) => (
                            <Toggle checked={field.value === "ACTIVE"} onChange={(v) => field.onChange(v ? "ACTIVE" : "INACTIVE")} label="On sale" />
                          )}
                        />
                        <button
                          type="button"
                          className="a-btn a-btn-ghost a-btn-sm"
                          style={{ color: "var(--admin-red)" }}
                          onClick={() => (f.id.startsWith("cl") || !values.ticketTypes?.[i]?.id ? remove(i) : setValue(`ticketTypes.${i}.remove`, true))}
                        >
                          <Icon name="trash" size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="a-btn a-btn-outline a-btn-sm" onClick={() => append({ name: "", priceNaira: 0, quantity: 20, status: "ACTIVE" })}>
                  <Icon name="plus" size={14} /> Add ticket type
                </button>
                {["Couple", "Group of 5"].map((n) => (
                  <button key={n} type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => append({ name: n, priceNaira: 0, quantity: 20, status: "ACTIVE" })}>
                    + {n}
                  </button>
                ))}
              </div>
            </section>

            <section id="goodtoknow" className="a-card p-5" onFocusCapture={() => setActiveSection("goodtoknow")}>
              <h2 className="admin-title mb-4 text-base font-bold">Good to know</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Age limit" htmlFor="f-age">
                  <input id="f-age" className="a-input" placeholder="18+" {...register("ageLimit")} />
                </Field>
                <Field label="What to wear" htmlFor="f-wear">
                  <input id="f-wear" className="a-input" placeholder="Anything comfy" {...register("whatToWear")} />
                </Field>
                <Field label="Running late?" htmlFor="f-late">
                  <input id="f-late" className="a-input" placeholder="Come anyway!" {...register("runningLate")} />
                </Field>
              </div>
            </section>

            <section id="faqs" className="a-card p-5" onFocusCapture={() => setActiveSection("faqs")}>
              <h2 className="admin-title mb-1 text-base font-bold">FAQs on this event</h2>
              <p className="a-hint mb-4">Pick up to 3 — they show at the bottom of the event page.</p>
              <Controller
                control={control}
                name="faqIds"
                render={({ field }) => (
                  <div className="space-y-2">
                    {faqs.map((f) => {
                      const checked = field.value.includes(f.id);
                      return (
                        <label key={f.id} className="a-card flex cursor-pointer items-center gap-3 px-4 py-3" style={{ opacity: !checked && field.value.length >= 3 ? 0.5 : 1 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!checked && field.value.length >= 3}
                            onChange={() => field.onChange(checked ? field.value.filter((x) => x !== f.id) : [...field.value, f.id])}
                          />
                          <span className="text-sm font-semibold">{f.question}</span>
                        </label>
                      );
                    })}
                    {faqs.length === 0 && <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>No FAQs yet — add them under Content → FAQs.</p>}
                  </div>
                )}
              />
            </section>

            <section id="checkout" className="a-card p-5" onFocusCapture={() => setActiveSection("checkout")}>
              <h2 className="admin-title mb-4 text-base font-bold">Checkout question</h2>
              <div className="space-y-4">
                <Field label="Ask buyers one thing" htmlFor="f-cq" hint="e.g. What's your preferred experience? Leave blank to skip.">
                  <input id="f-cq" className="a-input" {...register("checkoutQuestionText")} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    control={control}
                    name="checkoutQuestionRequired"
                    render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Required" />}
                  />
                  <Field label="Dropdown options" htmlFor="f-cqo" hint="Comma separated — blank means a free-text answer.">
                    <input id="f-cqo" className="a-input" placeholder="Painting, Karaoke, Picnic" {...register("checkoutQuestionOptions")} />
                  </Field>
                </div>
              </div>
            </section>

            <section id="visibility" className="a-card p-5" onFocusCapture={() => setActiveSection("visibility")}>
              <h2 className="admin-title mb-4 text-base font-bold">Visibility & status</h2>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Visibility">
                    {[
                      { v: "draft", label: "Save as draft" },
                      { v: "publish", label: "Publish now" },
                      { v: "schedule", label: "Schedule publish" },
                    ].map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        role="radio"
                        aria-checked={field.value === o.v}
                        className="a-btn a-btn-sm"
                        style={field.value === o.v ? { background: "var(--green)", color: "var(--cream)" } : { border: "1.5px solid var(--admin-line)", color: "var(--admin-ink-soft)" }}
                        onClick={() => field.onChange(o.v)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              />
              {values.visibility === "schedule" && (
                <div className="mt-4 max-w-xs">
                  <Field label="Publish at" htmlFor="f-sched">
                    <input id="f-sched" type="datetime-local" className="a-input" {...register("scheduledPublishAt")} />
                  </Field>
                </div>
              )}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Ticket status" htmlFor="f-override" hint="Auto means we work it out from sales and stock.">
                  <select id="f-override" className="a-select" {...register("statusOverride")}>
                    <option value="">Auto (recommended)</option>
                    <option value="coming-soon">Coming soon</option>
                    <option value="on-sale">Tickets on sale</option>
                    <option value="few-left">Few tickets left</option>
                    <option value="sold-out">Sold out</option>
                  </select>
                </Field>
                <Field label="“Few left” below" htmlFor="f-thresh" hint="Blank uses the site-wide default.">
                  <input id="f-thresh" type="number" min={0} className="a-input" placeholder="10" {...register("fewLeftThreshold")} />
                </Field>
              </div>
            </section>
          </div>
        </div>

        {/* Right column: preview + publish checklist */}
        <div className="space-y-4">
          <div className="a-card sticky top-16 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="admin-title text-sm font-bold">How it'll look</h2>
              <div className="a-card flex p-0.5" role="group" aria-label="Preview mode">
                {(["card", "hero"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setPreviewMode(m)} className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: previewMode === m ? "var(--green)" : "transparent", color: previewMode === m ? "var(--cream)" : "var(--admin-ink-soft)" }}>
                    {m === "card" ? "Card" : "Page"}
                  </button>
                ))}
              </div>
            </div>
            {previewMode === "card" ? (
              <div className="mx-auto max-w-[300px]">
                {/* @ts-expect-error preview uses a partial EventSummary */}
                <EventCard event={previewEvent} />
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl" style={{ background: "var(--cream)" }}>
                <div className="relative aspect-[16/9]" style={{ background: "var(--mint)" }}>
                  {values.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={values.coverImage} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest" style={{ background: "var(--green)", color: "var(--cream)" }}>
                    {values.statusOverride === "coming-soon" ? "Coming soon" : values.statusOverride === "sold-out" ? "Sold out" : "Tickets on sale"}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--orange)" }}>
                    {values.city || "City"} · {values.date || "date"}
                  </p>
                  <h3 className="admin-title mt-1 text-xl font-extrabold" style={{ color: "var(--green)" }}>
                    {values.name || "Your event name"}
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                    {values.venueName || "Venue"} · {values.startTime || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* Ready to publish checklist */}
            <div className="mt-4 rounded-xl p-3.5" style={{ background: "var(--admin-canvas)" }}>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide" style={{ color: "var(--admin-ink-soft)" }}>
                Ready to publish
              </p>
              <ul className="space-y-1.5">
                {checklist.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    <span
                      className="flex flex-none items-center justify-center rounded-full"
                      style={{ background: c.ok ? "var(--green)" : "var(--admin-grey-bg)", color: c.ok ? "var(--cream)" : "var(--admin-grey)", width: 18, height: 18 }}
                    >
                      {c.ok && <Icon name="check" size={11} />}
                    </span>
                    <span style={{ color: c.ok ? "var(--admin-ink)" : "var(--admin-ink-soft)" }}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <button type="submit" className="a-btn a-btn-orange w-full" disabled={isSubmitting || (values.visibility === "publish" && !ready)}>
                {isSubmitting ? "Saving…" : values.visibility === "publish" ? "Publish" : values.visibility === "schedule" ? "Schedule it" : "Save draft"}
              </button>
              {values.visibility === "publish" && !ready && (
                <p className="text-center text-xs" style={{ color: "var(--admin-amber)" }}>Tick off the checklist above first.</p>
              )}
              <div className="flex gap-2">
                {savedId && (
                  <a href={`/events/${values.slug || "preview"}`} target="_blank" className="a-btn a-btn-outline a-btn-sm flex-1">
                    <Icon name="external" size={14} /> Preview on site
                  </a>
                )}
                {eventId && (
                  <button type="button" className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }} onClick={() => setDeleteOpen(true)}>
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
              <p className="text-center text-xs" aria-live="polite" style={{ color: "var(--admin-ink-soft)", minHeight: 16 }}>
                {saving === "saving" ? "Saving…" : saving === "saved" ? "Saved just now" : savedId && eventStatus === "DRAFT" ? "Autosaves as you type" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete “${values.name}”?`}
        body={<>This removes the event and its ticket types for good. If it has paid orders you'll need to archive it instead.</>}
        confirmLabel="Delete"
        requireText={values.name}
        onConfirm={async () => {
          const res = await fetch(`/api/v1/admin/events/${eventId}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            toast("Deleted.");
            router.push("/admin/events?tab=all");
          } else toast(data.error || "Couldn't delete.", { error: true });
        }}
      />
    </form>
  );
}
