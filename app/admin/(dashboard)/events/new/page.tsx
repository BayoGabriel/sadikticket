"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createEvent } from '@/features/admin/events/api';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const input = {
      name: fd.get('name'),
      description: fd.get('description') || '',
      shortDescription: fd.get('shortDescription') || '',
      includes: String(fd.get('includes') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: String(fd.get('tags') || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      eventType: fd.get('eventType') || undefined,
      directions: fd.get('directions') || '',
      mapLink: fd.get('mapLink') || '',
      statusOverride: fd.get('statusOverride') || null,
      venueName: fd.get('venueName') || '',
      venueAddress: fd.get('venueAddress') || '',
      city: fd.get('city') || '',
      state: fd.get('state') || undefined,
      country: fd.get('country') || '',
      startsAt: fd.get('startsAt'),
      endsAt: fd.get('endsAt'),
      timezone: fd.get('timezone') || 'Africa/Lagos',
      capacity: Number(fd.get('capacity') || 0),
    };
    try {
      const created = await createEvent(input);
      router.replace(`/admin/events/${created.id}/edit`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create event</h1>
        <p className="text-[#6B6B6B]">Start with the basics. You can edit details later.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Event name</label>
            <input name="name" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">One-line hook (shown on cards)</label>
            <input name="shortDescription" placeholder="Paint, sip and take your canvas home." className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">What&apos;s included (comma-separated)</label>
            <input name="includes" placeholder="Canvas, paint and brushes, apron, drink, snack" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Event type</label>
              <select name="eventType" defaultValue="" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2">
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
              <label className="block text-sm font-medium">Tags (comma-separated)</label>
              <input name="tags" placeholder="evening, outdoor, beginner-friendly, good-for-groups" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Status override</label>
              <select name="statusOverride" defaultValue="" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2">
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
            <label className="block text-sm font-medium">Start (ISO)</label>
            <input name="startsAt" type="datetime-local" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">End (ISO)</label>
            <input name="endsAt" type="datetime-local" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <input name="timezone" defaultValue="Africa/Lagos" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Capacity</label>
            <input name="capacity" type="number" min={0} className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Venue</label>
            <input name="venueName" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input name="venueAddress" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <select name="city" defaultValue="" required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2">
              <option value="" disabled>Pick one</option>
              <option value="Lagos">Lagos</option>
              <option value="Benin City">Benin City</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input name="state" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input name="country" defaultValue="Nigeria" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Directions / parking / landmark</label>
            <textarea name="directions" rows={2} placeholder="How to get there, where to park, the landmark to look for." className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Map link (optional — auto-built from address if blank)</label>
            <input name="mapLink" type="url" placeholder="https://maps.google.com/…" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center gap-3">
          <button disabled={loading} className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Creating…' : 'Create event'}</button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 hover:bg-[#F3F3F0]">Cancel</button>
        </div>
      </form>
    </div>
  );
}
