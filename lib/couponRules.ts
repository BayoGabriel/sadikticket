// Pure coupon rule evaluation — no DB. couponService calls this after
// fetching the coupon; the per-customer check stays in the service (it
// needs an order count) and passes the result through.
export type CouponShape = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  active: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  usageCount: number;
  perCustomerLimit?: number | null;
  eventId?: unknown;
  eventIds?: unknown[];
  ticketTypeIds?: unknown[] | null;
  minOrderAmount?: number | null;
};

export type CouponVerdict =
  | { valid: true; discount: number; code: string; label: string }
  | { valid: false; reason: string };

export function evaluateCouponRules(
  coupon: CouponShape | null,
  ctx: {
    eventId: string;
    /** kobo subtotal of qualifying items */
    subtotal: number;
    ticketTypeIds?: string[];
    /** resolved by the caller — orders already placed with this code */
    customerPriorUses?: number;
    now?: Date;
  },
): CouponVerdict {
  if (!coupon || !coupon.active)
    return { valid: false, reason: "That code doesn't look right." };

  const now = ctx.now ?? new Date();
  if (coupon.startsAt && now < coupon.startsAt)
    return { valid: false, reason: "That code isn't live yet." };
  if (coupon.expiresAt && now > coupon.expiresAt)
    return { valid: false, reason: "That code has expired." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit)
    return { valid: false, reason: "That code has been fully used." };

  // Event scope: single eventId OR the multi-event list.
  const scopedEvents = [
    ...(coupon.eventId ? [String(coupon.eventId)] : []),
    ...(coupon.eventIds ?? []).map(String),
  ];
  if (scopedEvents.length && !scopedEvents.includes(String(ctx.eventId)))
    return { valid: false, reason: "That code isn't valid for this event." };

  if (
    coupon.perCustomerLimit != null &&
    coupon.perCustomerLimit > 0 &&
    (ctx.customerPriorUses ?? 0) >= coupon.perCustomerLimit
  )
    return { valid: false, reason: "You've already used that code." };

  const base = ctx.subtotal;
  if (coupon.ticketTypeIds?.length) {
    const allowed = new Set(coupon.ticketTypeIds.map(String));
    const wanted = (ctx.ticketTypeIds ?? []).filter((id) => allowed.has(id));
    if (!wanted.length)
      return { valid: false, reason: "That code doesn't cover those tickets." };
  }

  if (coupon.minOrderAmount && base < coupon.minOrderAmount)
    return {
      valid: false,
      reason: `That code needs a minimum order of ₦${(coupon.minOrderAmount / 100).toLocaleString("en-NG")}.`,
    };

  const discount =
    coupon.kind === "percent"
      ? Math.floor((base * Math.min(coupon.value, 100)) / 100)
      : Math.min(coupon.value, base);

  const label =
    coupon.kind === "percent"
      ? `${coupon.value}% off`
      : `₦${(coupon.value / 100).toLocaleString("en-NG")} off`;

  return { valid: true, discount, code: coupon.code, label };
}
