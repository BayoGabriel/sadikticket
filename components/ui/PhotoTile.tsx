// Placeholder media tile used until real event photos/videos are available.
export function PhotoTile({
  label,
  kind = "PHOTO",
  className = "",
}: {
  label: string;
  kind?: "PHOTO" | "VIDEO" | "MAP";
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-end overflow-hidden rounded-2xl bg-gradient-to-br from-[#003118] via-[#0a4a2c] to-[#f27a00]/70 p-4 ${className}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full border-[14px] border-white/10" />
      <span className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
        {kind} · {label}
      </span>
    </div>
  );
}
