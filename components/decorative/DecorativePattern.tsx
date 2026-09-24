import React from "react";

export function DecorativePattern({ className = "", stroke = "#E66D0B", opacity = 0.15 }: { className?: string; stroke?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g opacity={opacity} stroke={stroke} strokeWidth="2">
        <circle cx="60" cy="60" r="40" />
        <circle cx="200" cy="120" r="60" />
        <path d="M20 220 C 80 180, 140 260, 260 200" />
      </g>
    </svg>
  );
}
