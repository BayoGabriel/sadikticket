// Orange ticker strip — "Painting · Clay · Karaoke …" scrolling slowly,
// pauses on hover, disabled for reduced-motion users.
export function Marquee({ items }: { items: string[] }) {
  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-6 pr-6 text-sm font-bold tracking-wide text-[#003118]"
    >
      {items.map((t, i) => (
        <span key={`${t}-${i}`} className="flex items-center gap-6">
          <span>{t}</span>
          <span className="text-[#003118]/60">·</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee overflow-hidden bg-[#f27a00] py-3">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
