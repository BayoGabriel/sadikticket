import { NextRequest } from 'next/server';
import { ok, fail } from '@/lib/response';
import { eventService } from '@/services/eventService';

// GET /api/v1/events/:slug (public event details)
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const ev = await eventService.getPublicBySlug(params.slug);
    return ok({
      id: ev._id.toString(),
      name: ev.name,
      slug: ev.slug,
      description: ev.description,
      coverImage: ev.coverImage,
      venueName: ev.venueName,
      venueAddress: ev.venueAddress,
      city: ev.city,
      state: ev.state,
      country: ev.country,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      timezone: ev.timezone,
    });
  } catch (e: any) {
    return fail(e);
  }
}
