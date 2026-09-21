import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDb } from '@/lib/db';
import { UserModel } from '@/models/user';
import { env } from '@/lib/env';
import { fail } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) throw new Error('email, password, and name are required');

    await connectDb();
    const count = await UserModel.countDocuments();
    if (count > 0) {
      return new Response(JSON.stringify({ success: false, error: 'Already initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const u = await UserModel.create({ email, passwordHash, name, role: 'SUPER_ADMIN' });

    const token = jwt.sign({ id: u._id.toString(), role: u.role, email: u.email }, env.JWT_SECRET, { expiresIn: '7d' });

    return new Response(JSON.stringify({ success: true, data: { role: u.role, email: u.email } }), {
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
