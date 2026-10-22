"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";

// Chip editor: type + Enter/comma adds, × removes, Backspace pops last.
export function ChipInput({
  value,
  onChange,
  placeholder,
  suggestions,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  label?: string;
}) {
  const [draft, setDraft] = useState("");
  const remaining = (suggestions ?? []).filter((s) => !value.includes(s));

  function add(raw: string) {
    const v = raw.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  }

  return (
    <div>
      <div
        className="a-input flex min-h-[44px] flex-wrap items-center gap-1.5 py-1.5"
        onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}
      >
        {value.map((chip) => (
          <span key={chip} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "var(--mint)", color: "var(--green)" }}>
            {chip}
            <button type="button" aria-label={`Remove ${chip}`} onClick={() => onChange(value.filter((c) => c !== chip))}>
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          placeholder={value.length ? "" : placeholder}
          value={draft}
          aria-label={label ?? placeholder}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(",")) add(v.slice(0, -1));
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(draft); }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border px-2.5 py-1 text-xs font-semibold"
              style={{ borderColor: "var(--admin-line)", color: "var(--admin-ink-soft)" }}
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
