import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { couponService } from "@/services/couponService";
import { auditService } from "@/services/auditService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";

// GET /api/v1/admin/coupons?format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("coupons");
    await connectDb();
    const [items, events] = await Promise.all([
      couponService.list(),
      EventModel.find().select("name").lean(),
    ]);
    const eventName = new Map(events.map((e) => [String(e._id), e.name]));
    const rows = items.map((c) => ({
      id: String(c._id),
      code: c.code,
      kind: c.kind,
      value: c.value,
      startsAt: c.startsAt ?? null,
      expiresAt: c.expiresAt ?? null,
      usageCount: c.usageCount,
      usageLimit: c.usageLimit ?? null,
      perCustomerLimit: c.perCustomerLimit ?? null,
      minOrderAmount: c.minOrderAmount ?? null,
      eventIds: (c.eventIds ?? []).map(String),
      eventNames: [
        ...(c.eventId ? [eventName.get(String(c.eventId)) ?? ""] : []),
        ...(c.eventIds ?? []).map((e) => eventName.get(String(e)) ?? ""),
      ].filter(Boolean),
      ticketTypeIds: (c.ticketTypeIds ?? []).map(String),
      discountedTotal: c.discountedTotal ?? 0,
      active: c.active,
    }));
    if (req.nextUrl.searchParams.get("format") === "csv") {
      return csvResponse(
        toCsv(
          rows.map((r) => ({
            ...r,
            value: r.kind === "percent" ? `${r.value}%` : r.value / 100,
            events: r.eventNames.join("; ") || "All events",
            usage: `${r.usageCount}${r.usageLimit != null ? `/${r.usageLimit}` : ""}`,
          })),
          [
            { key: "code", label: "Code" },
            { key: "value", label: "Value" },
            { key: "events", label: "Events" },
            { key: "usage", label: "Used" },
            { key: "discountedTotal", label: "Discounted ₦" },
            { key: "active", label: "Active" },
          ],
        ),
        "coupons.csv",
      );
    }
    return ok({ items: rows });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const createSchema = z.object({
  code: z.string().min(3, "At least 3 characters.").max(24).optional(),
  kind: z.enum(["percent", "fixed"]),
  value: z.number().positive("Value must be above zero."),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perCustomerLimit: z.number().int().positive().optional().nullable(),
  minOrderNaira: z.number().positive().optional().nullable(),
  eventIds: z.array(z.string()).optional(),
  ticketTypeIds: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "SEREN-";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

// POST /api/v1/admin/coupons
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("coupons");
    const input = createSchema.parse(await req.json());
    const code = (input.code?.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "") || generateCode());
    const doc = await couponService.create({
      code,
      kind: input.kind,
      value: input.kind === "percent" ? Math.min(input.value, 100) : Math.round(input.value * 100),
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      usageLimit: input.usageLimit ?? undefined,
      perCustomerLimit: input.perCustomerLimit ?? undefined,
      minOrderAmount: input.minOrderNaira ? Math.round(input.minOrderNaira * 100) : undefined,
      eventIds: input.eventIds ?? [],
      ticketTypeIds: input.ticketTypeIds ?? [],
      active: input.active ?? true,
    });
    await auditService.record({
      actor: user,
      action: "coupon.created",
      entityType: "coupon",
      entityId: String(doc._id),
      entityLabel: doc.code,
    });
    return ok({ id: String(doc._id), code: doc.code }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
