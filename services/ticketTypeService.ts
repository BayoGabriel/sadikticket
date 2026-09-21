import { TicketTypeModel } from '@/models/ticketType';
import { EventModel } from '@/models/event';
import { connectDb } from '@/lib/db';
import { ApiError } from '@/lib/errors';

export const ticketTypeService = {
  async listPublicByEventSlug(slug: string, now = new Date()) {
    await connectDb();
    const event = await EventModel.findOne({ slug, status: 'PUBLISHED' }).lean();
    if (!event) throw new ApiError('EVENT_NOT_FOUND', 'Event not found', 404);

    const types = await TicketTypeModel.find({
      eventId: event._id,
      status: 'ACTIVE',
      $and: [
        { $or: [{ salesStart: null }, { salesStart: { $lte: now } }] },
        { $or: [{ salesEnd: null }, { salesEnd: { $gte: now } }] },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return { event, types };
  },
};
