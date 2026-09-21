import { ReactNode } from 'react';
import Link from 'next/link';

export default function EventSectionLayout({ children, params }: { children: ReactNode; params: { eventId: string } }) {
  const links = [
    { href: `/admin/events/${params.eventId}`, label: 'Overview' },
    { href: `/admin/events/${params.eventId}/edit`, label: 'Edit' },
    { href: `/admin/events/${params.eventId}/tickets`, label: 'Tickets' },
  ];
  return (
    <div className="space-y-6">
      <nav className="rounded-2xl bg-white border border-[#E8E8E5] p-3 flex gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-[#F3F3F0] border border-transparent hover:border-[#E8E8E5]">{l.label}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
