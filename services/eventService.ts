import slugify from 'slugify';
import { EventModel, EventStatus } from '@/models/event';
import { connectDb } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Types } from 'mongoose';

export type CreateEventInput = {
  createdById: string;
  name: string;
  description?: string;
  venueName: string;
  venueAddress: string;
  city: string;
  state?: string;
  country: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
  capacity: number;
};

function assertStatusTransition(prev: EventStatus, next: EventStatus) {
  const allowed: Record<EventStatus, EventStatus[]> = {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['DRAFT', 'CANCELLED', 'COMPLETED'],
    CANCELLED: [],
    COMPLETED: [],
  };
  if (!allowed[prev].includes(next)) {
    throw new ApiError('VALIDATION_ERROR', `Invalid status transition ${prev} → ${next}`, 400);
  }
}

export const eventService = {
  async create(input: CreateEventInput) {
    await connectDb();
    const baseSlug = slugify(input.name, { lower: true, strict: true });
    let slug = baseSlug;
    let n = 1;
    while (await EventModel.exists({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }
    const doc = await EventModel.create({
      createdBy: new Types.ObjectId(input.createdById),
      name: input.name,
      slug,
      description: input.description,
      venueName: input.venueName,
      venueAddress: input.venueAddress,
      city: input.city,
      state: input.state,
      country: input.country,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      timezone: input.timezone,
      capacity: input.capacity,
      status: 'DRAFT',
      publishedAt: null,
    });
    return doc;
  },

  async list(params: { page: number; limit: number; search?: string; status?: EventStatus; sort?: string; order?: 'asc' | 'desc'; createdById?: string; }) {
    await connectDb();
    const query: any = {};
    if (params.status) query.status = params.status;
    if (params.search) query.name = { $regex: params.search, $options: 'i' };
    if (params.createdById) query.createdBy = new Types.ObjectId(params.createdById);

    const sortField = params.sort ?? 'createdAt';
    const sortOrder = params.order === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      EventModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      EventModel.countDocuments(query),
    ]);

    return { items, total };
  },

  async getById(eventId: string) {
    await connectDb();
    const ev = await EventModel.findById(eventId).lean();
    if (!ev) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);
    return ev;
  },

  async update(eventId: string, patch: Partial<{ name: string; description?: string; venueName: string; venueAddress: string; city: string; state?: string; country: string; startsAt: Date; endsAt: Date; timezone: string; capacity: number; status: EventStatus; }>) {
    await connectDb();
    const curr = await EventModel.findById(eventId);
    if (!curr) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);
    if (patch.status && patch.status !== curr.status) {
      assertStatusTransition(curr.status as EventStatus, patch.status);
      if (patch.status === 'PUBLISHED' && !curr.publishedAt) curr.publishedAt = new Date();
      if (patch.status === 'DRAFT') curr.publishedAt = null;
    }
    Object.assign(curr, patch);
    await curr.save();
    return curr.toObject();
  },

  async remove(eventId: string) {
    await connectDb();
    const res = await EventModel.deleteOne({ _id: new Types.ObjectId(eventId) });
    if (res.deletedCount === 0) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);
    return true;
  },

  async getPublicBySlug(slug: string) {
    await connectDb();
    const ev = await EventModel.findOne({ slug, status: 'PUBLISHED' }).lean();
    if (!ev) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);
    return ev;
  },
};
