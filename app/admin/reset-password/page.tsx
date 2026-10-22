"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-canvas flex min-h-screen items-center justify-center p-6">
      <div className="a-card w-full max-w-sm p-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/artlogo.png" alt="SerenArt" width={110} height={30} className="mb-6" />
        {done ? (
          <>
            <h1 className="admin-title text-2xl font-extrabold">All set.</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--admin-ink-soft)" }}>
              Your password&apos;s been updated.
            </p>
            <Link href="/admin/login" className="a-btn a-btn-orange mt-5 w-full">
              Sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="admin-title text-2xl font-extrabold">Choose a new password</h1>
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="a-label" htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  className="a-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="a-hint">At least 8 characters.</p>
              </div>
              {error && <p className="a-error-text" role="alert">{error}</p>}
              <button disabled={loading || !token} className="a-btn a-btn-orange w-full">
                {loading ? "Saving…" : "Save new password"}
              </button>
              {!token && (
                <p className="a-error-text">This link looks broken — ask for a fresh one.</p>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
