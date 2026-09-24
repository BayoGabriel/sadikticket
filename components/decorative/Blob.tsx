import React from "react";

export function Blob({ className = "", color = "#E6EEEB", opacity = 1 }: { className?: string; color?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill={color}
        fillOpacity={opacity}
        d="M45.7,-69.3C58.7,-60.3,67.6,-47,73.7,-32.5C79.9,-17.9,83.2,-2.1,82.1,12.7C80.9,27.5,75.3,41.2,65.7,53.5C56.1,65.8,42.6,76.7,27.7,81.8C12.7,86.9,-3.6,86.2,-18.2,81.2C-32.7,76.2,-45.4,66.9,-56.2,55.4C-66.9,43.8,-75.6,30,-78.6,14.4C-81.6,-1.3,-78.8,-18.7,-72.1,-34.2C-65.5,-49.7,-55.1,-63.4,-41.4,-72.9C-27.8,-82.4,-10.9,-87.7,3.2,-92.1C17.3,-96.6,34.6,-100.2,45.7,-69.3Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
