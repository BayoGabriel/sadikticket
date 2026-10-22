import { z } from 'zod';

const base = {
  name: z.string().max(120).optional(),
  email: z.string().email(),
  phone: z.string().max(32).optional(),
};

export const enquirySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('private-booking'),
    ...base,
    name: z.string().min(1).max(120),
    occasion: z.string().max(120).optional(),
    experience: z.string().max(200).optional(),
    date: z.string().max(60).optional(),
    guests: z.string().max(60).optional(),
    location: z.string().max(120).optional(),
    extra: z.string().max(2000).optional(),
  }),
  z.object({
    kind: z.literal('business'),
    ...base,
    name: z.string().min(1).max(120),
    company: z.string().max(160).optional(),
    service: z.string().max(120).optional(),
    size: z.string().max(60).optional(),
    date: z.string().max(60).optional(),
    location: z.string().max(120).optional(),
    frequency: z.string().max(60).optional(),
    goals: z.string().max(2000).optional(),
  }),
  z.object({
    kind: z.literal('waitlist'),
    ...base,
    eventSlug: z.string().min(1).max(200),
    eventName: z.string().max(200).optional(),
  }),
  z.object({
    kind: z.literal('updates'),
    ...base,
    city: z.string().max(120).optional(),
  }),
  z.object({
    kind: z.literal('general'),
    ...base,
    name: z.string().min(1).max(120),
    message: z.string().min(1).max(2000),
  }),
]);
