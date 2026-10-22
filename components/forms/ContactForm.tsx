"use client";
import { useState } from "react";
import { siteConfig, whatsappUrl } from "@/lib/site-config";

const inputCls =
  "mt-1 w-full rounded-xl border border-[#e0dfcf] bg-white px-3.5 py-2.5 text-sm text-[#003118] outline-none transition focus:border-[#003118]/40 focus:ring-2 focus:ring-[#003118]/10";

export function ContactForm({ responseTime }: { responseTime?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const wa = whatsappUrl("Hi SerenArt! Quick question.");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { kind: "general" };
    for (const [k, v] of fd.entries()) {
      const s = String(v).trim();
      if (s) payload[k] = s;
    }
    try {
      const res = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.error?.message || "Something went wrong");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[#003118]/15 bg-[#e6eeeb] p-6 text-center">
        <p className="font-semibold text-[#003118]">Got it, thank you!</p>
        <p className="mt-2 text-sm leading-6 text-[#4a4a45]">
          We&apos;ll reach out within {responseTime || siteConfig.responseTime}. Want to chat now?{" "}
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#003118] underline underline-offset-2"
            >
              Message us on WhatsApp.
            </a>
          ) : (
            "Message us on WhatsApp."
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#003118]">
            Your name
          </label>
          <input name="name" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#003118]">
            Email
          </label>
          <input name="email" type="email" required className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#003118]">
          What&apos;s on your mind?
        </label>
        <textarea name="message" rows={5} required className={inputCls} />
      </div>
      {state === "error" && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={state === "loading"} className="btn btn-orange">
        {state === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
