"use client";
import { useState } from "react";

export function NotifyWaitlistButton({ eventId }: { eventId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<string | null>(null);

  const notify = async () => {
    if (!confirm("Email everyone on this event's waitlist?")) return;
    setState("loading");
    setResult(null);
    try {
      const res = await fetch(
        `/api/v1/admin/events/${eventId}/notify-waitlist`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setResult(`Sent ${data.data.notified} of ${data.data.total}`);
      setState("done");
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Failed");
      setState("idle");
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={notify}
        disabled={state === "loading"}
        className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0] disabled:opacity-60"
      >
        {state === "loading" ? "Sending…" : "Notify waitlist"}
      </button>
      {result && <span className="text-sm text-[#6B6B6B]">{result}</span>}
    </span>
  );
}
