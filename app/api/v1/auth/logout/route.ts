// POST /api/v1/auth/logout
export async function POST() {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: {
      'Set-Cookie': `admin_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0` ,
      'Content-Type': 'application/json',
    },
  });
}
