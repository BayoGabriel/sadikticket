import Link from 'next/link';

async function fetchAdminEventsSummary() {
  const res = await fetch(`${process.env.APP_URL || ''}/api/v1/admin/events?limit=5`, { cache: 'no-store' });
  if (!res.ok) return { items: [], total: 0 };
  const data = await res.json();
  if (!data.success) return { items: [], total: 0 };
  return data.data as { items: any[]; total: number };
}

export default async function AdminDashboard() {
  const { items, total } = await fetchAdminEventsSummary();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-[#6B6B6B]">Operational overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
          <div className="text-sm text-[#6B6B6B]">Total Events</div>
          <div className="mt-2 text-2xl font-semibold">{total}</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
          <div className="text-sm text-[#6B6B6B]">Upcoming</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
          <div className="text-sm text-[#6B6B6B]">Tickets Sold</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
          <div className="text-sm text-[#6B6B6B]">Revenue</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#E8E8E5]">
        <div className="p-6 border-b border-[#E8E8E5] flex items-center justify-between">
          <h2 className="font-semibold">Recent Events</h2>
          <Link href="/admin/events" className="text-sm text-emerald-700 hover:underline">View all</Link>
        </div>
        <ul className="divide-y divide-[#E8E8E5]">
          {items.map((e) => (
            <li key={e.id} className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-sm text-[#6B6B6B]">{new Date(e.startsAt).toLocaleString()}</div>
              </div>
              <Link href={`/admin/events/${e.id}`} className="text-sm text-emerald-700 hover:underline">Manage</Link>
            </li>
          ))}
          {items.length === 0 && (
            <li className="p-6 text-[#6B6B6B]">No events yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}
