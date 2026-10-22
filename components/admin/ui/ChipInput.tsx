"use client";

import { useState } from "react";
import { Icon } from "./icons";

// Enter-to-add chip list. Used for what's-included, who-it-suits, tags etc.
export function ChipInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };

  return (
    <div className="a-input" style={{ padding: "0.35rem" }}>
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: "var(--mint)", color: "var(--green)" }}
          >
            {chip}
            <button
              type="button"
              aria-label={`Remove ${chip}`}
              onClick={() => onChange(value.filter((c) => c !== chip))}
              className="rounded-full p-0.5 hover:bg-white/60"
            >
              <Icon name="x" size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="min-w-[10rem] flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
