"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Pick dates" },
];

export function RangePicker() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("range") || "7d";
  const [custom, setCustom] = useState(current === "custom");

  function set(range: string, extra?: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    next.set("range", range);
    if (range !== "custom") {
      next.delete("from");
      next.delete("to");
    }
    if (extra) for (const [k, v] of Object.entries(extra)) next.set(k, v);
    router.push(`/admin?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="a-card flex overflow-hidden p-0.5" role="group" aria-label="Date range">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setCustom(o.value === "custom");
              if (o.value !== "custom") set(o.value);
              else if (sp.get("from")) set("custom");
            }}
            className="min-h-[36px] rounded-full px-3.5 text-sm font-bold transition-colors"
            style={{
              background: current === o.value ? "var(--green)" : "transparent",
              color: current === o.value ? "var(--cream)" : "var(--admin-ink-soft)",
            }}
            aria-pressed={current === o.value}
          >
            {o.label}
          </button>
        ))}
      </div>
      {custom && (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            set("custom", { from: String(fd.get("from")), to: String(fd.get("to")) });
          }}
        >
          <input type="date" name="from" defaultValue={sp.get("from") || ""} className="a-input" style={{ width: "auto", minHeight: 38 }} required />
          <span style={{ color: "var(--admin-ink-soft)" }}>→</span>
          <input type="date" name="to" defaultValue={sp.get("to") || ""} className="a-input" style={{ width: "auto", minHeight: 38 }} required />
          <button className="a-btn a-btn-green a-btn-sm">Apply</button>
        </form>
      )}
    </div>
  );
}
