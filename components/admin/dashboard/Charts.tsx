// Lightweight inline-SVG charts — no chart dependency, brand colours only.
import { formatNaira } from "@/lib/format";

export function SalesAreaChart({
  series,
}: {
  series: { day: string; revenue: number; orders: number }[];
}) {
  const W = 640;
  const H = 180;
  const pad = { l: 8, r: 8, t: 10, b: 24 };
  const max = Math.max(1, ...series.map((s) => s.revenue));
  const stepX = series.length > 1 ? (W - pad.l - pad.r) / (series.length - 1) : 0;
  const points = series.map((s, i) => ({
    x: pad.l + i * stepX,
    y: pad.t + (1 - s.revenue / max) * (H - pad.t - pad.b),
    ...s,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pad.l + (series.length - 1) * stepX},${H - pad.b} L${pad.l},${H - pad.b} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Sales over time">
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f27a00" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f27a00" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#salesFill)" />
        <path d={path} fill="none" stroke="#f27a00" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f27a00">
            <title>{`${p.day}: ${formatNaira(p.revenue)} · ${p.orders} orders`}</title>
          </circle>
        ))}
        {series.length > 1 &&
          [0, Math.floor(series.length / 2), series.length - 1].map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={H - 8}
              fontSize="10"
              fill="#6b6b6b"
              textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
            >
              {series[i].day.slice(5)}
            </text>
          ))}
      </svg>
      {series.every((s) => s.revenue === 0) && (
        <p className="text-center text-sm" style={{ color: "var(--admin-ink-soft)" }}>
          No sales in this window yet — they'll show up here.
        </p>
      )}
    </div>
  );
}

export function TicketsBarChart({
  data,
}: {
  data: { name: string; tickets: number; revenue: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.tickets));
  if (!data.length)
    return (
      <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
        No tickets sold in this window.
      </p>
    );
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="truncate font-semibold">{d.name}</span>
            <span style={{ color: "var(--admin-ink-soft)" }}>
              {d.tickets} · {formatNaira(d.revenue)}
            </span>
          </div>
          <div className="a-progress">
            <span style={{ width: `${(d.tickets / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CitySplit({ cities }: { cities: Record<string, number> }) {
  const total = Object.values(cities).reduce((a, b) => a + b, 0);
  const entries = [
    { name: "Lagos", value: cities.Lagos ?? 0, color: "var(--orange)" },
    { name: "Benin City", value: cities["Benin City"] ?? 0, color: "var(--green-2)" },
    { name: "Other", value: cities.other ?? 0, color: "var(--mint-2)" },
  ].filter((e) => e.value > 0);

  if (!total)
    return (
      <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
        No sales by city yet.
      </p>
    );

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full" style={{ background: "var(--admin-grey-bg)" }}>
        {entries.map((e) => (
          <span key={e.name} style={{ width: `${(e.value / total) * 100}%`, background: e.color }} />
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
              {e.name}
            </span>
            <span className="font-semibold">{formatNaira(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
