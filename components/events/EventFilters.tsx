"use client";
import clsx from "clsx";

const filters = [
  { key: undefined, label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
] as const;

export function EventFilters({
  value,
  onChange,
}: {
  value?: "today" | "week" | "month";
  onChange: (v?: "today" | "week" | "month") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={String(f.key)}
          onClick={() => onChange(f.key as any)}
          className={clsx(
            "rounded-full border px-3 py-1.5 text-sm transition",
            value === f.key
              ? "bg-(--brand-primary) text-white border-(--brand-primary)"
              : "bg-white text-(--text-primary) border-(--border) hover:bg-(--surface-muted)",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
