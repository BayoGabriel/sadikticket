"use client";
import { useState } from "react";

// Email capture used for "Tell me first" / waitlist moments.
export function NotifyForm({
  kind,
  eventSlug,
  eventName,
  city,
  buttonLabel = "Tell me first",
  successMessage = "Done. We'll tell you first.",
  placeholder = "Your email",
  className = "",
  successClassName = "",
}: {
  kind: "waitlist" | "updates";
  eventSlug?: string;
  eventName?: string;
  city?: string;
  buttonLabel?: string;
  successMessage?: string;
  placeholder?: string;
  className?: string;
  successClassName?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    try {
      const res = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, email, eventSlug, eventName, city }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.error?.message || "Something went wrong");
      setState("done");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p
        className={`text-sm font-medium ${successClassName || "text-[#003118]"} ${className}`}
      >
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="Email address"
          className="min-w-0 flex-1 rounded-full border border-[#e0dfcf] bg-white px-4 py-2.5 text-sm text-[#003118] outline-none transition focus:border-[#003118]/40"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-full bg-[#f27a00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d56c00] disabled:opacity-60"
        >
          {state === "loading" ? "Sending…" : buttonLabel}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
