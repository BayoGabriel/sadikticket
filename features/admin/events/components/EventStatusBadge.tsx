export function EventStatusBadge({ status }: { status: string }) {
  const color = status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'DRAFT' ? 'bg-[#F3F3F0] text-[#171717] border-[#E8E8E5]'
    : status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-[#F3F3F0] text-[#171717] border-[#E8E8E5]';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}
