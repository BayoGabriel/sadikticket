import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import { ok, fail } from '@/lib/response';
import { updateEventSchema } from '@/schemas/event';
import { eventService } from '@/services/eventService';

// GET /api/v1/admin/events/:eventId
export async function GET(_req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    await requireRole(['SUPER_ADMIN', 'EVENT_ADMIN']);
    const ev = await eventService.getById(params.eventId);
    return ok({
      id: ev._id.toString(),
      name: ev.name,
      slug: ev.slug,
      description: ev.description,
      venueName: ev.venueName,
      venueAddress: ev.venueAddress,
      city: ev.city,
      state: ev.state,
      country: ev.country,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      timezone: ev.timezone,
      capacity: ev.capacity,
      status: ev.status,
      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt,
    });
  } catch (e: any) {
    return fail(e);
  }
}

// PATCH /api/v1/admin/events/:eventId
export async function PATCH(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    await requireRole(['SUPER_ADMIN', 'EVENT_ADMIN']);
    const patch = updateEventSchema.parse(await req.json());
    const updated = await eventService.update(params.eventId, patch);
    return ok({ id: updated._id.toString(), status: updated.status, updatedAt: updated.updatedAt });
  } catch (e: any) {
    return fail(e);
  }
}

// DELETE /api/v1/admin/events/:eventId
export async function DELETE(_req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    await requireRole(['SUPER_ADMIN']);
    await eventService.remove(params.eventId);
    return ok({});
  } catch (e: any) {
    return fail(e);
  }
}
