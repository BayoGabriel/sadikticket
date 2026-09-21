import { notFound } from 'next/navigation';
import { getEventBySlug, listTicketTypesBySlug } from '@/features/checkout/api';

function Price({ amount, currency }: { amount: number; currency: string }) {
  return <span>{currency} {amount.toLocaleString()}</span>;
}

export default async function PublicEventPage({ params }: { params: { slug: string } }) {
  const ev = await getEventBySlug(params.slug);
  if (!ev) return notFound();
  const ticketTypes = await listTicketTypesBySlug(params.slug);

  return (
    <main className="flex-1 bg-[#FAFAF8]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-3xl font-semibold text-[#171717]">{ev.name}</h1>
            <div className="text-[#6B6B6B]">{new Date(ev.startsAt).toLocaleString()}</div>
            <article className="prose max-w-none text-[#171717]">{ev.description || '—'}</article>
          </div>
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
              <h2 className="font-semibold">Tickets</h2>
              <div className="mt-4 space-y-4">
                {ticketTypes.map((t) => (
                  <form key={t.id} action={`/events/${params.slug}/checkout`} method="get" className="rounded-xl border border-[#E8E8E5] p-4">
                    <div className="font-medium">{t.name}</div>
                    {t.description && <div className="text-sm text-[#6B6B6B]">{t.description}</div>}
                    <div className="mt-2"><Price amount={t.price} currency={t.currency} /></div>
                    <div className="mt-3 flex items-center gap-2">
                      <input type="hidden" name="ticketTypeId" value={t.id} />
                      <input type="number" name="quantity" min={1} max={10} defaultValue={1} className="w-20 rounded-lg border border-[#E8E8E5] px-3 py-2" />
                      <button className="ml-auto rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700">Select</button>
                    </div>
                  </form>
                ))}
                {ticketTypes.length === 0 && <div className="text-[#6B6B6B]">No tickets available</div>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
