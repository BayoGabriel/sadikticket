import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
  sort: z.enum(['createdAt', 'startsAt', 'name']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const createEventSchema = z.object({
  name: z.string().min(3),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  includes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  eventType: z.string().optional(),
  directions: z.string().optional(),
  mapLink: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  faqIds: z.array(z.string()).optional(),
  statusOverride: z
    .enum(["on-sale", "few-left", "sold-out", "coming-soon"])
    .nullable()
    .optional(),
  venueName: z.string().min(1),
  venueAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).optional(),
  country: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  timezone: z.string().min(1),
  capacity: z.number().int().min(0),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});
