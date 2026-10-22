import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
  sort: z.enum(['createdAt', 'startsAt', 'name']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

const checkoutQuestionSchema = z
  .object({
    text: z.string().max(140),
    required: z.boolean().default(false),
    options: z.array(z.string()).default([]),
  })
  .nullable()
  .optional();

export const createEventSchema = z.object({
  name: z.string().min(3),
  shortDescription: z.string().max(100, 'Keep the hook under 100 characters.').optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  coverImageAlt: z.string().optional(),
  includes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  eventType: z.string().optional(),
  directions: z.string().optional(),
  mapLink: z.string().optional(),
  mapImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  faqIds: z.array(z.string()).optional(),
  statusOverride: z
    .enum(["on-sale", "few-left", "sold-out", "coming-soon"])
    .nullable()
    .optional(),
  venueName: z.string().min(1),
  venueAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  doorsOpenAt: z.coerce.date().nullable().optional(),
  timezone: z.string().min(1),
  capacity: z.number().int().min(0),
  scheduledPublishAt: z.coerce.date().nullable().optional(),
  fewLeftThreshold: z.number().int().min(0).nullable().optional(),
  checkoutQuestion: checkoutQuestionSchema,
  goodToKnow: z
    .object({
      ageLimit: z.string().default(''),
      whatToWear: z.string().default(''),
      runningLate: z.string().default(''),
    })
    .optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
});

// Full editor payload — event fields + ticket types in one save.
export const eventEditorSchema = createEventSchema.extend({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only.').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', 'ARCHIVED']).optional(),
  ticketTypes: z
    .array(
      z.object({
        id: z.string().optional(), // existing ticket type
        name: z.string().min(1, 'Every ticket needs a name.'),
        description: z.string().optional(),
        priceNaira: z.number().min(0),
        quantity: z.number().int().min(0),
        maxPerOrder: z.number().int().min(1).nullable().optional(),
        salesStart: z.string().nullable().optional(),
        salesEnd: z.string().nullable().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
        remove: z.boolean().optional(),
      }),
    )
    .optional(),
});
export type EventEditorInput = z.infer<typeof eventEditorSchema>;
