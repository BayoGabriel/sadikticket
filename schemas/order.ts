import { z } from 'zod';

export const orderCreateSchema = z.object({
  eventId: z.string().min(1),
  items: z.array(
    z.object({
      ticketTypeId: z.string().min(1),
      quantity: z.number().int().min(1).max(10),
    })
  ).min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6).max(32).optional(),
  }),
});
