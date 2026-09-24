import React from "react";

export function BrushShape({ className = "", color = "#E6EEEB", opacity = 0.8 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 140C40 80 120 60 170 70C220 80 270 70 280 40C290 10 230 10 170 20C110 30 60 10 30 30C0 50 0 100 20 140Z"
        fill={color}
        opacity={opacity}
      />
    </svg>
  );
}
