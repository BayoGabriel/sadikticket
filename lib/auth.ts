import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "./env";
import { ApiError } from "./errors";
import { UserModel, UserRole, type User } from "@/models/user";
import { connectDb } from "./db";

export type AuthUser = { id: string; role: UserRole; email: string; name: string };

// ── Roles ────────────────────────────────────────────────────────────────────
// Modern roles plus normalisation for legacy values already in the database.
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

// ── Permissions ─────────────────────────────────────────────────────────────
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

// ── Session ──────────────────────────────────────────────────────────────────
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    await connectDb();
    const user = await UserModel.findById(decoded.id).lean<User | null>();
    if (!user || user.active === false) return null;
    return {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  return user;
}

export async function requireRole(roles: (UserRole | Role)[]) {
  const user = await requireAuth();
  const allowed = roles.map(normalizeRole);
  if (!allowed.includes(normalizeRole(user.role)))
    throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  if (!can(user.role, permission))
    throw new ApiError("FORBIDDEN", "Insufficient permissions", 403);
  return user;
}
