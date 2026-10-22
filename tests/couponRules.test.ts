import { describe, it, expect } from "vitest";
import { evaluateCouponRules, type CouponShape } from "@/lib/couponRules";

const base: CouponShape = {
  code: "PAINT10",
  kind: "percent",
  value: 10,
  active: true,
  usageCount: 0,
};

const ctx = (over: Partial<Parameters<typeof evaluateCouponRules>[1]> = {}) => ({
  eventId: "ev-1",
  subtotal: 30000_00,
  now: new Date("2026-01-15T12:00:00Z"),
  ...over,
});

describe("evaluateCouponRules", () => {
  it("rejects missing or inactive codes", () => {
    expect(evaluateCouponRules(null, ctx())).toEqual({ valid: false, reason: expect.any(String) });
    expect(evaluateCouponRules({ ...base, active: false }, ctx()).valid).toBe(false);
  });

  it("honours the sale window", () => {
    const future = { ...base, startsAt: new Date("2026-02-01") };
    expect(evaluateCouponRules(future, ctx()).valid).toBe(false);
    const past = { ...base, expiresAt: new Date("2026-01-01") };
    expect(evaluateCouponRules(past, ctx()).valid).toBe(false);
  });

  it("blocks fully-used and per-customer-limited codes", () => {
    const used = { ...base, usageLimit: 3, usageCount: 3 };
    expect(evaluateCouponRules(used, ctx()).valid).toBe(false);
    const perCust = { ...base, perCustomerLimit: 1 };
    expect(evaluateCouponRules(perCust, ctx({ customerPriorUses: 1 })).valid).toBe(false);
    expect(evaluateCouponRules(perCust, ctx({ customerPriorUses: 0 })).valid).toBe(true);
  });

  it("scopes to events and ticket types", () => {
    const evScoped = { ...base, eventIds: ["ev-2"] };
    expect(evaluateCouponRules(evScoped, ctx()).valid).toBe(false);
    expect(evaluateCouponRules(evScoped, ctx({ eventId: "ev-2" })).valid).toBe(true);

    const ttScoped = { ...base, ticketTypeIds: ["tt-a"] };
    expect(evaluateCouponRules(ttScoped, ctx({ ticketTypeIds: ["tt-b"] })).valid).toBe(false);
    expect(evaluateCouponRules(ttScoped, ctx({ ticketTypeIds: ["tt-a", "tt-b"] })).valid).toBe(true);
  });

  it("enforces the minimum order", () => {
    const min = { ...base, minOrderAmount: 50000_00 };
    expect(evaluateCouponRules(min, ctx()).valid).toBe(false);
    expect(evaluateCouponRules(min, ctx({ subtotal: 60000_00 })).valid).toBe(true);
  });

  it("computes percent and fixed discounts, capped correctly", () => {
    const pct = evaluateCouponRules(base, ctx());
    expect(pct).toMatchObject({ valid: true, discount: 3000_00 });

    const fixed = evaluateCouponRules({ ...base, kind: "fixed", value: 5000_00 }, ctx());
    expect(fixed).toMatchObject({ valid: true, discount: 5000_00 });

    // fixed discount never exceeds the order
    const over = evaluateCouponRules({ ...base, kind: "fixed", value: 999999_00 }, ctx());
    expect(over).toMatchObject({ valid: true, discount: 30000_00 });

    // percent is clamped at 100
    const silly = evaluateCouponRules({ ...base, value: 150 }, ctx());
    expect(silly).toMatchObject({ valid: true, discount: 30000_00 });
  });
});
