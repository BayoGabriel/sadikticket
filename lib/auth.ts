import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "./env";
import { ApiError } from "./errors";
import { UserModel, UserRole, type User } from "@/models/user";
import { connectDb } from "./db";

import {
  can,
  normalizeRole,
  permissionsFor,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  type Permission,
  type Role,
} from "./permissions";

export type AuthUser = { id: string; role: UserRole; email: string; name: string };

// Role/permission logic lives in ./permissions (pure, unit-tested).
export {
  can,
  normalizeRole,
  permissionsFor,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  type Permission,
  type Role,
};

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
