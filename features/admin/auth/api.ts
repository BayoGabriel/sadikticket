export type AdminMe = { id: string; email: string; role: 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'CHECK_IN_STAFF' };

export async function getMe(): Promise<AdminMe | null> {
  const res = await fetch('/api/v1/auth/me', { cache: 'no-store' });
  if (res.status === 401) return null;
  const data = await res.json();
  if (!data.success) return null;
  return data.data as AdminMe;
}

export async function login(email: string, password: string): Promise<AdminMe> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data?.error?.message || 'Login failed');
  // After login, call /me to get role/id consistently
  const me = await getMe();
  if (!me) throw new Error('Unable to load session');
  return me;
}

export async function logout(): Promise<void> {
  await fetch('/api/v1/auth/logout', { method: 'POST' });
}
