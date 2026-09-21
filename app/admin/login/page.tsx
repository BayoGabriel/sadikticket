"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/features/admin/auth/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-[#FAFAF8]">
      <div className="hidden lg:block p-12">
        <div className="h-full rounded-3xl bg-white border border-[#E8E8E5] flex items-center justify-center">
          <div className="max-w-md p-8 text-center">
            <h1 className="text-2xl font-semibold text-[#171717]">Welcome back</h1>
            <p className="mt-2 text-[#6B6B6B]">Sign in to manage your events</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-[#E8E8E5] rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#171717] text-xl font-semibold">Admin Sign in</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#171717]">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#171717]">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
