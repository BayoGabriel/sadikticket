import { ok, fail } from '@/lib/response';
import { getAuthUser } from '@/lib/auth';

// GET /api/v1/auth/me
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } }), { status: 401 });
    return ok({ id: user.id, email: user.email, role: user.role });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
