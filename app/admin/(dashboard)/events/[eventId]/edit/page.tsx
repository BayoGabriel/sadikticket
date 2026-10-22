"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvent, updateEvent } from "@/features/admin/events/api";
import { ImageUploader } from "@/components/admin/events/ImageUploader";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ev, setEv] = useState<any | null>(null);
  const { eventId } = use(params);

  useEffect(() => {
    (async () => {
      try {
        const e = await getEvent(eventId);
        setEv(e);
      } catch (e: any) {
        setError(e?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ev) return;
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const patch: any = {
      name: fd.get("name") || undefined,
      shortDescription: fd.get("shortDescription") || undefined,
      description: fd.get("description") || undefined,
      includes: String(fd.get("includes") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: String(fd.get("tags") || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      eventType: fd.get("eventType") || undefined,
      directions: fd.get("directions") || undefined,
      mapLink: fd.get("mapLink") || undefined,
      statusOverride: fd.get("statusOverride") || null,
      startsAt: fd.get("startsAt") || undefined,
      endsAt: fd.get("endsAt") || undefined,
      timezone: fd.get("timezone") || undefined,
      venueName: fd.get("venueName") || undefined,
      venueAddress: fd.get("venueAddress") || undefined,
      city: fd.get("city") || undefined,
      state: fd.get("state") || undefined,
      country: fd.get("country") || undefined,
      capacity: fd.get("capacity") ? Number(fd.get("capacity")) : undefined,
    };
    try {
      await updateEvent(eventId, patch);
      router.replace(`/admin/events/${eventId}`);
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
        Loading…
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 text-red-600">
        {error}
      </div>
    );
  if (!ev)
    return (
      <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
        Event not found
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit event</h1>
        <p className="text-[#6B6B6B]">Update details for {ev.name}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Event image</label>
            <div className="mt-2">
              <ImageUploader eventId={eventId} initialUrl={ev.coverImage} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Event name</label>
            <input
              name="name"
              defaultValue={ev.name}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              One-line hook (shown on cards)
            </label>
            <input
              name="shortDescription"
              defaultValue={ev.shortDescription}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={ev.description}
              rows={4}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              What&apos;s included (comma-separated)
            </label>
            <input
              name="includes"
              defaultValue={(ev.includes || []).join(", ")}
              placeholder="Canvas, paint and brushes, apron, drink, snack"
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Event type</label>
              <select
                name="eventType"
                defaultValue={ev.eventType || ""}
                className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
              >
                <option value="">Pick one</option>
                <option value="painting">Painting</option>
                <option value="pottery">Pottery</option>
                <option value="karaoke">Karaoke</option>
                <option value="picnic">Picnic</option>
                <option value="trivia">Trivia</option>
                <option value="rnb">RnB night</option>
                <option value="beach">Beach day</option>
                <option value="mixer">Mixer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Tags (comma-separated)
              </label>
              <input
                name="tags"
                defaultValue={(ev.tags || []).join(", ")}
                placeholder="evening, outdoor, beginner-friendly, good-for-groups"
                className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status override</label>
              <select
                name="statusOverride"
                defaultValue={ev.statusOverride || ""}
                className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
              >
                <option value="">Auto (from ticket sales)</option>
                <option value="on-sale">Tickets on sale</option>
                <option value="few-left">Few tickets left</option>
                <option value="sold-out">Sold out</option>
                <option value="coming-soon">Coming soon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Start</label>
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={
                ev.startsAt
                  ? new Date(ev.startsAt).toISOString().slice(0, 16)
                  : ""
              }
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End</label>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={
                ev.endsAt ? new Date(ev.endsAt).toISOString().slice(0, 16) : ""
              }
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <input
              name="timezone"
              defaultValue={ev.timezone || "Africa/Lagos"}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Capacity</label>
            <input
              name="capacity"
              type="number"
              min={0}
              defaultValue={ev.capacity ?? ""}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Venue</label>
            <input
              name="venueName"
              defaultValue={ev.venueName}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              name="venueAddress"
              defaultValue={ev.venueAddress}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              name="city"
              defaultValue={ev.city}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input
              name="state"
              defaultValue={ev.state}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input
              name="country"
              defaultValue={ev.country}
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              Directions / parking / landmark
            </label>
            <textarea
              name="directions"
              defaultValue={ev.directions}
              rows={2}
              placeholder="How to get there, where to park, the landmark to look for."
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">
              Map link (optional — auto-built from address if blank)
            </label>
            <input
              name="mapLink"
              type="url"
              defaultValue={ev.mapLink}
              placeholder="https://maps.google.com/…"
              className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 hover:bg-[#F3F3F0]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
