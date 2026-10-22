"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/features/admin/auth/api";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace(next);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setForgotSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-canvas grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--green)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/artlogo.png" alt="SerenArt" width={140} height={38} style={{ filter: "brightness(0) invert(1) brightness(1.15)" }} />
        <div>
          <h1 className="admin-title text-4xl font-extrabold xl:text-5xl" style={{ color: "var(--cream)" }}>
            Run the fun<br />from <span style={{ color: "var(--orange)" }}>one place.</span>
          </h1>
          <p className="mt-4 max-w-sm text-base" style={{ color: "rgba(255,254,221,0.7)" }}>
            Events, tickets, door check-in, enquiries and content — everything a
            busy events team needs, nothing it doesn't.
          </p>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,254,221,0.5)" }}>
          Fun things to do with people, in Lagos and Benin City.
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6">
        <div className="a-card w-full max-w-sm p-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/artlogo.png" alt="SerenArt" width={110} height={30} className="mb-6 lg:hidden" />
          <h2 className="admin-title text-2xl font-extrabold">Welcome back</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            Sign in to manage your events.
          </p>

          {forgotOpen ? (
            forgotSent ? (
              <div className="mt-6 text-sm">
                <p style={{ color: "var(--admin-ink)" }}>
                  If that email is on the team, a reset link is on its way. Check
                  your inbox (and spam, just in case).
                </p>
                <button type="button" className="a-btn a-btn-ghost mt-4" onClick={() => setForgotOpen(false)}>
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={onForgot} className="mt-6 space-y-4">
                <div>
                  <label className="a-label" htmlFor="forgot-email">Your work email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="a-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button disabled={loading} className="a-btn a-btn-orange w-full">
                  {loading ? "Sending…" : "Send me a reset link"}
                </button>
                <button type="button" className="a-btn a-btn-ghost w-full" onClick={() => setForgotOpen(false)}>
                  ← Back to sign in
                </button>
              </form>
            )
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="a-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="a-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="a-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="a-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="a-error-text" role="alert">{error}</p>
              )}
              <button disabled={loading} className="a-btn a-btn-orange w-full">
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm font-semibold"
                style={{ color: "var(--green)" }}
                onClick={() => setForgotOpen(true)}
              >
                Forgot your password?
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
