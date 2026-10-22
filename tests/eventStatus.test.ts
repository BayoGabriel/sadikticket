import { describe, it, expect } from "vitest";
import { eventStatusLabel } from "@/lib/eventStatus";

const now = new Date("2026-01-15T12:00:00Z");
const t = (over = {}) => ({
  isOnSale: true,
  salesStart: new Date("2026-01-01"),
  salesEnd: undefined,
  quantityAvailable: 20,
  ...over,
});

describe("eventStatusLabel", () => {
  it("says Coming soon when nothing is on sale yet", () => {
    const future = t({ salesStart: new Date("2026-03-01") });
    expect(eventStatusLabel({ ticketTypes: [future], now })).toBe("Coming soon");
    expect(eventStatusLabel({ ticketTypes: [], now })).toBe("Coming soon");
  });

  it("says Tickets on sale when plenty remain", () => {
    expect(eventStatusLabel({ ticketTypes: [t()], now })).toBe("Tickets on sale");
  });

  it("says Few tickets left at or below the threshold", () => {
    expect(
      eventStatusLabel({ ticketTypes: [t({ quantityAvailable: 4 })], fewLeftThreshold: 10, now }),
    ).toBe("Few tickets left");
  });

  it("says Sold out at zero remaining, ignoring not-yet-on-sale stock", () => {
    expect(eventStatusLabel({ ticketTypes: [t({ quantityAvailable: 0 })], now })).toBe("Sold out");
  });

  it("manual override wins over automatic logic", () => {
    expect(
      eventStatusLabel({ ticketTypes: [t()], statusOverride: "sold-out", now }),
    ).toBe("Sold out");
    expect(
      eventStatusLabel({ ticketTypes: [t({ quantityAvailable: 0 })], statusOverride: "on-sale", now }),
    ).toBe("Tickets on sale");
  });

  it("draft and cancelled always win", () => {
    expect(eventStatusLabel({ ticketTypes: [t()], eventStatus: "DRAFT", now })).toBe("Draft");
    expect(eventStatusLabel({ ticketTypes: [t()], eventStatus: "CANCELLED", now })).toBe("Cancelled");
  });
});
