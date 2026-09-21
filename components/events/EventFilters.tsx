"use client";
import clsx from 'clsx';

const filters = [
  { key: undefined, label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
] as const;

export function EventFilters({ value, onChange }: { value?: 'today' | 'week' | 'month'; onChange: (v?: 'today' | 'week' | 'month') => void; }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={String(f.key)}
          onClick={() => onChange(f.key as any)}
          className={clsx(
            'rounded-full border px-3 py-1.5 text-sm transition',
            value === f.key ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-[#171717] border-[#E8E8E5] hover:bg-[#F3F3F0]'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
