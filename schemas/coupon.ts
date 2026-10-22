import { z } from "zod";

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(64),
  eventId: z.string().min(1),
  ticketTypeIds: z.array(z.string()).optional(),
  customerEmail: z.string().email().optional(),
});

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(64),
  kind: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  expiresAt: z.coerce.date().optional(),
  usageLimit: z.number().int().min(1).optional(),
  eventId: z.string().optional(),
  active: z.boolean().optional(),
});

export const couponUpdateSchema = z.object({
  active: z.boolean().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
});
