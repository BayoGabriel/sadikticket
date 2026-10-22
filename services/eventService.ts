import slugify from "slugify";
import { EventModel, EventStatus, type Event } from "@/models/event";
import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { Types } from "mongoose";

export type CreateEventInput = {
  createdById: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  includes?: string[];
  tags?: string[];
  eventType?: string;
  directions?: string;
  mapLink?: string;
  gallery?: string[];
  faqIds?: string[];
  statusOverride?: string | null;
  venueName: string;
  venueAddress: string;
  city: string;
  state?: string;
  country: string;
  startsAt: Date;
  endsAt: Date;
  doorsOpenAt?: Date | null;
  timezone: string;
  capacity: number;
  scheduledPublishAt?: Date | null;
  fewLeftThreshold?: number | null;
  checkoutQuestion?: { text: string; required: boolean; options: string[] } | null;
  goodToKnow?: { ageLimit: string; whatToWear: string; runningLate: string };
  coverImageAlt?: string;
  mapImage?: string;
};

function assertStatusTransition(prev: EventStatus, next: EventStatus) {
  const allowed: Record<EventStatus, EventStatus[]> = {
    DRAFT: ["PUBLISHED", "ARCHIVED"],
    PUBLISHED: ["DRAFT", "CANCELLED", "COMPLETED", "ARCHIVED"],
    CANCELLED: ["ARCHIVED"],
    COMPLETED: ["ARCHIVED"],
    ARCHIVED: ["DRAFT"],
  };
  if (!allowed[prev].includes(next)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Invalid status transition ${prev} → ${next}`,
      400,
    );
  }
}

export const eventService = {
  async create(input: CreateEventInput) {
    await connectDb();
    const baseSlug = input.slug
      ? slugify(input.slug, { lower: true, strict: true })
      : slugify(input.name, { lower: true, strict: true });
    let slug = baseSlug;
    let n = 1;
    while (await EventModel.exists({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }
    const doc = await EventModel.create({
      createdBy: new Types.ObjectId(input.createdById),
      name: input.name,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      includes: input.includes ?? [],
      tags: input.tags ?? [],
      eventType: input.eventType,
      directions: input.directions,
      mapLink: input.mapLink,
      gallery: input.gallery ?? [],
      faqIds: input.faqIds ?? [],
      statusOverride: input.statusOverride ?? null,
      venueName: input.venueName,
      venueAddress: input.venueAddress,
      city: input.city,
      state: input.state,
      country: input.country,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      doorsOpenAt: input.doorsOpenAt ?? null,
      timezone: input.timezone,
      capacity: input.capacity,
      scheduledPublishAt: input.scheduledPublishAt ?? null,
      fewLeftThreshold: input.fewLeftThreshold ?? undefined,
      checkoutQuestion: input.checkoutQuestion ?? undefined,
      goodToKnow: input.goodToKnow,
      coverImageAlt: input.coverImageAlt,
      mapImage: input.mapImage,
      status: "DRAFT",
      publishedAt: null,
    });
    return doc;
  },

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: EventStatus;
    sort?: string;
    order?: "asc" | "desc";
    createdById?: string;
  }) {
    await connectDb();
    const query: Record<string, unknown> = {};
    if (params.status) query.status = params.status;
    if (params.search) query.name = { $regex: params.search, $options: "i" };
    if (params.createdById)
      query.createdBy = new Types.ObjectId(params.createdById);

    const sortField = params.sort ?? "createdAt";
    const sortOrder = params.order === "asc" ? 1 : -1;

    const [items, total] = await Promise.all([
      EventModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean<Event[]>(),
      EventModel.countDocuments(query),
    ]);

    return { items, total };
  },

  async getById(eventId: string) {
    await connectDb();
    const ev = await EventModel.findById(eventId).lean<Event | null>();
    if (!ev) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    return ev;
  },

  async update(
    eventId: string,
    patch: Partial<{
      name: string;
      shortDescription?: string;
      description?: string;
      includes?: string[];
      tags?: string[];
      eventType?: string;
      directions?: string;
      mapLink?: string;
      gallery?: string[];
      faqIds?: string[];
      statusOverride?: string | null;
      venueName: string;
      venueAddress: string;
      city: string;
      state?: string;
      country: string;
      startsAt: Date;
      endsAt: Date;
      doorsOpenAt?: Date | null;
      timezone: string;
      capacity: number;
      status: EventStatus;
      scheduledPublishAt?: Date | null;
      fewLeftThreshold?: number | null;
      checkoutQuestion?: { text: string; required: boolean; options: string[] } | null;
      goodToKnow?: { ageLimit: string; whatToWear: string; runningLate: string };
      coverImageAlt?: string;
      coverImage?: string;
      mapImage?: string;
    }>,
  ) {
    await connectDb();
    const curr = await EventModel.findById(eventId);
    if (!curr) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    if (patch.status && patch.status !== curr.status) {
      assertStatusTransition(curr.status as EventStatus, patch.status);
      if (patch.status === "PUBLISHED" && !curr.publishedAt)
        curr.publishedAt = new Date();
      if (patch.status === "DRAFT") curr.publishedAt = null;
    }
    Object.assign(curr, patch);
    await curr.save();
    return curr.toObject();
  },

  async remove(eventId: string) {
    await connectDb();
    const res = await EventModel.deleteOne({
      _id: new Types.ObjectId(eventId),
    });
    if (res.deletedCount === 0)
      throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    return true;
  },

  async getPublicBySlug(slug: string) {
    await connectDb();
    const ev = await EventModel.findOne({
      slug,
      status: "PUBLISHED",
    }).lean<Event | null>();
    if (!ev) throw new ApiError("EVENT_NOT_FOUND", "Event not found", 404);
    return ev;
  },
};
