// Hand-drawn-feeling SVG accents — squiggles, stars, circles. Used sparingly
// to keep the site feeling human rather than templated.

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M2 8c8-6 14-6 20 0s12 6 20 0 14-6 20 0 12 6 20 0 14-6 20 0 12 6 16 3"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className={className}>
      <path d="M16 2l3.2 9.4 9.8.5-7.5 6.4 2.5 9.7-8-5.4-8 5.4 2.5-9.7-7.5-6.4 9.8-.5L16 2z" />
    </svg>
  );
}

export function ScribbleCircle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={className}>
      <path
        d="M50 8c22-2 40 14 42 36S80 84 54 88 12 78 10 52 26 12 48 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
