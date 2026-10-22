// Role + permission tables — pure logic, no server deps, so it can be
// unit-tested and shared between auth helpers and any client-safe code.
import type { UserRole } from "@/models/user";

export type Role =
  | "OWNER"
  | "MANAGER"
  | "EVENTS_STAFF"
  | "DOOR_STAFF"
  | "CONTENT_EDITOR";

export function normalizeRole(role: UserRole | string): Role {
  switch (role) {
    case "SUPER_ADMIN":
      return "OWNER";
    case "EVENT_ADMIN":
      return "EVENTS_STAFF";
    case "CHECK_IN_STAFF":
      return "DOOR_STAFF";
    default:
      return role as Role;
  }
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  EVENTS_STAFF: "Events staff",
  DOOR_STAFF: "Door staff",
  CONTENT_EDITOR: "Content editor",
};

// Fine-grained capabilities. Every admin API/action checks these server-side;
// the sidebar merely hides links a role can't open.
export type Permission =
  | "dashboard"
  | "events"
  | "orders"
  | "checkin"
  | "waitlist"
  | "coupons"
  | "enquiries"
  | "subscribers"
  | "reviews"
  | "content"
  | "settings"
  | "emails"
  | "team"
  | "audit";

const ALL: Permission[] = [
  "dashboard",
  "events",
  "orders",
  "checkin",
  "waitlist",
  "coupons",
  "enquiries",
  "subscribers",
  "reviews",
  "content",
  "settings",
  "emails",
  "team",
  "audit",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: ALL,
  // everything except team, settings, emails config and the audit log
  MANAGER: ALL.filter(
    (p) => !["team", "settings", "emails", "audit"].includes(p),
  ),
  EVENTS_STAFF: [
    "dashboard",
    "events",
    "orders",
    "checkin",
    "waitlist",
    "coupons",
    "enquiries",
  ],
  DOOR_STAFF: ["checkin"],
  CONTENT_EDITOR: ["dashboard", "content", "reviews", "subscribers"],
};

export function can(role: UserRole | string, permission: Permission) {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission);
}

export function permissionsFor(role: UserRole | string) {
  return ROLE_PERMISSIONS[normalizeRole(role)];
}
