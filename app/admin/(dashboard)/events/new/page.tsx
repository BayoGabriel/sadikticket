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
      venueName: fd.get('venueName') || '',
      venueAddress: fd.get('venueAddress') || '',
      city: fd.get('city') || '',
      state: fd.get('state') || '',
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
            <label className="block text-sm font-medium">Short description</label>
            <input name="shortDescription" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" rows={4} className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
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
            <input name="venueName" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input name="venueAddress" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input name="city" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">State</label>
            <input name="state" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Country</label>
            <input name="country" className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2" />
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
