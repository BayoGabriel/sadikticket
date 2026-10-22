import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { fail } from '@/lib/response';
import { ApiError } from '@/lib/errors';
import { UserModel } from '@/models/user';
import { connectDb } from '@/lib/db';
import { env } from '@/lib/env';

// 8 attempts per 10 min per IP+email — brute-force protection for the door.
const limiter = new RateLimiterMemory({ points: 8, duration: 600 });

function sessionCookie(token: string) {
  return `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${
    env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

// POST /api/v1/auth/login  { email, password }
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      throw new ApiError('VALIDATION_ERROR', 'Email and password are required', 400);

    await limiter.consume(`${ip}:${String(email).toLowerCase()}`).catch(() => {
      throw new ApiError('RATE_LIMITED', 'Too many attempts. Wait a few minutes and try again.', 429);
    });

    await connectDb();

    // Bootstrap: if no users exist, first login creates the OWNER account
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const hash = await bcrypt.hash(password, 10);
      const u = await UserModel.create({ email, passwordHash: hash, name: email.split('@')[0], role: 'OWNER', lastLoginAt: new Date() });
      const token = jwt.sign({ id: u._id.toString(), role: u.role, email: u.email }, env.JWT_SECRET, { expiresIn: '7d' });
      return new Response(JSON.stringify({ success: true, data: { role: u.role, email: u.email, name: u.name } }), {
        status: 200,
        headers: { 'Set-Cookie': sessionCookie(token), 'Content-Type': 'application/json' },
      });
    }

    const user = await UserModel.findOne({
      email: { $regex: `^${String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (!user) throw new ApiError('UNAUTHORIZED', 'Invalid email or password', 401);
    if (user.active === false)
      throw new ApiError('FORBIDDEN', 'This account has been deactivated.', 403);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError('UNAUTHORIZED', 'Invalid email or password', 401);

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
    return new Response(JSON.stringify({ success: true, data: { role: user.role, email: user.email, name: user.name } }), {
      status: 200,
      headers: { 'Set-Cookie': sessionCookie(token), 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
