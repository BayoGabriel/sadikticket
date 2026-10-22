"use client";

import { useState, type ReactNode } from "react";

// Keyboard-accessible accordion rows (button + aria-expanded + region).
export function Accordion({
  items,
  className = "",
}: {
  items: { title: string; body: ReactNode }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={`divide-y divide-[#003118]/10 rounded-3xl bg-white ${className}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`acc-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-base font-semibold text-[#003118]">
                {item.title}
              </span>
              <span
                aria-hidden
                className={`text-xl leading-none text-[#f27a00] transition-transform duration-200 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              id={`acc-panel-${i}`}
              role="region"
              hidden={!isOpen}
              className="px-6 pb-5 text-sm leading-7 text-[#575750]"
            >
              {item.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
