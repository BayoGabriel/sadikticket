import React from "react";

export function AccentCircle({ className = "", color = "#f27a00", opacity = 0.15 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="50" cy="50" r="48" fill={color} fillOpacity={opacity} />
    </svg>
  );
}
