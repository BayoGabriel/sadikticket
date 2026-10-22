import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { couponValidateSchema } from "@/schemas/coupon";
import { couponService } from "@/services/couponService";

// POST /api/v1/coupons/validate (public)
// { code, eventId, subtotal } → { valid, discount?, label? }
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = couponValidateSchema.parse(json);
    const result = await couponService.validate(
      input.code,
      input.eventId,
      Number(json.subtotal ?? 0),
      { ticketTypeIds: input.ticketTypeIds, customerEmail: input.customerEmail },
    );
    return ok(result);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
