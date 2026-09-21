import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { env } from './env';
import { ApiError } from './errors';
import { UserModel, UserRole } from '@/models/user';
import { connectDb } from './db';

export type AuthUser = { id: string; role: UserRole; email: string };

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    await connectDb();
    const user = await UserModel.findById(decoded.id).lean();
    if (!user) return null;
    return { id: user._id.toString(), role: user.role, email: user.email };
  } catch {
    return null;
  }
}

export async function requireRole(roles: UserRole[]) {
  const user = await getAuthUser();
  if (!user) throw new ApiError('UNAUTHORIZED', 'Authentication required', 401);
  if (!roles.includes(user.role)) throw new ApiError('FORBIDDEN', 'Insufficient permissions', 403);
  return user;
}
