import { describe, it, expect } from "vitest";
import { can, normalizeRole } from "@/lib/permissions";

describe("normalizeRole", () => {
  it("maps legacy roles onto the modern set", () => {
    expect(normalizeRole("SUPER_ADMIN")).toBe("OWNER");
    expect(normalizeRole("EVENT_ADMIN")).toBe("EVENTS_STAFF");
    expect(normalizeRole("CHECK_IN_STAFF")).toBe("DOOR_STAFF");
  });
});

describe("can()", () => {
  it("owner can do everything", () => {
    for (const p of ["events", "orders", "content", "settings", "team", "emails", "audit"] as const) {
      expect(can("OWNER", p)).toBe(true);
    }
  });

  it("manager can do everything except settings/team", () => {
    expect(can("MANAGER", "events")).toBe(true);
    expect(can("MANAGER", "orders")).toBe(true);
    expect(can("MANAGER", "content")).toBe(true);
    expect(can("MANAGER", "settings")).toBe(false);
    expect(can("MANAGER", "team")).toBe(false);
    expect(can("MANAGER", "emails")).toBe(false);
    expect(can("MANAGER", "audit")).toBe(false);
  });

  it("events staff can run events/orders/check-in/waitlist but not content or settings", () => {
    expect(can("EVENTS_STAFF", "events")).toBe(true);
    expect(can("EVENTS_STAFF", "orders")).toBe(true);
    expect(can("EVENTS_STAFF", "checkin")).toBe(true);
    expect(can("EVENTS_STAFF", "waitlist")).toBe(true);
    expect(can("EVENTS_STAFF", "enquiries")).toBe(true);
    expect(can("EVENTS_STAFF", "content")).toBe(false);
    expect(can("EVENTS_STAFF", "settings")).toBe(false);
  });

  it("door staff only get check-in", () => {
    expect(can("DOOR_STAFF", "checkin")).toBe(true);
    expect(can("DOOR_STAFF", "orders")).toBe(false);
    expect(can("DOOR_STAFF", "events")).toBe(false);
    expect(can("DOOR_STAFF", "dashboard")).toBe(false);
  });

  it("content editor only edits content", () => {
    expect(can("CONTENT_EDITOR", "content")).toBe(true);
    expect(can("CONTENT_EDITOR", "reviews")).toBe(true);
    expect(can("CONTENT_EDITOR", "events")).toBe(false);
    expect(can("CONTENT_EDITOR", "orders")).toBe(false);
  });

  it("legacy roles inherit the mapped permissions", () => {
    expect(can("CHECK_IN_STAFF", "checkin")).toBe(true);
    expect(can("CHECK_IN_STAFF", "orders")).toBe(false);
    expect(can("EVENT_ADMIN", "events")).toBe(true);
    expect(can("EVENT_ADMIN", "team")).toBe(false);
  });
});
