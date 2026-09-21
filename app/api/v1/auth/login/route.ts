import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ok, fail } from '@/lib/response';
import { UserModel } from '@/models/user';
import { connectDb } from '@/lib/db';
import { env } from '@/lib/env';

// POST /api/v1/auth/login  { email, password }
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) throw new Error('email and password required');

    await connectDb();

    // Bootstrap: if no users exist, first login creates SUPER_ADMIN
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const hash = await bcrypt.hash(password, 10);
      const u = await UserModel.create({ email, passwordHash: hash, name: email.split('@')[0], role: 'SUPER_ADMIN' });
      const token = jwt.sign({ id: u._id.toString(), role: u.role, email: u.email }, env.JWT_SECRET, { expiresIn: '7d' });
      return new Response(JSON.stringify({ success: true, data: { role: u.role, email: u.email } }), {
        status: 200,
        headers: {
          'Set-Cookie': `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`,
          'Content-Type': 'application/json',
        },
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
    return new Response(JSON.stringify({ success: true, data: { role: user.role, email: user.email } }), {
      status: 200,
      headers: {
        'Set-Cookie': `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`,
        'Content-Type': 'application/json',
      },
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
