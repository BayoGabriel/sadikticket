import { z } from 'zod';

export const createTicketTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0), // kobo/lowest unit
  currency: z.string().min(1),
  quantity: z.number().int().min(0),
  salesStart: z.coerce.date().optional().nullable(),
  salesEnd: z.coerce.date().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateTicketTypeSchema = createTicketTypeSchema.partial();
