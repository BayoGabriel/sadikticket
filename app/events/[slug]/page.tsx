import { notFound } from "next/navigation";
import { getEventBySlug, listTicketTypesBySlug } from "@/features/checkout/api";
import Image from "next/image";
import { Blob } from "@/components/decorative/Blob";
import { AccentCircle } from "@/components/decorative/AccentCircle";
import { BrushShape } from "@/components/decorative/BrushShape";

function Price({ amount, currency }: { amount: number; currency: string }) {
  return (
    <span>
      {currency} {amount.toLocaleString()}
    </span>
  );
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ev = await getEventBySlug(slug);
  if (!ev) return notFound();
  const ticketTypes = await listTicketTypesBySlug(slug);

  return (
    <main className="flex-1 bg-(--surface-muted)">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[#EAF3F0] to-transparent" />
        <Blob
          className="pointer-events-none absolute -top-20 -left-24 w-96 h-96"
          color="#E6EEEB"
          opacity={0.7}
        />
        <AccentCircle className="pointer-events-none absolute -right-24 -top-8 w-64 h-64" />
        <BrushShape
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-10 w-120 h-80"
          color="#FFE1CC"
          opacity={0.5}
        />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-3xl overflow-hidden shadow-sm bg-white border border-(--border)">
            {ev.coverImage ? (
              <div className="relative aspect-4/3">
                <Image
                  src={ev.coverImage}
                  alt={ev.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/5 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white/90 text-sm">
                    {new Date(ev.startsAt).toLocaleString()}
                  </div>
                  <h1 className="mt-1 text-white text-3xl font-semibold drop-shadow">
                    {ev.name}
                  </h1>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <h1 className="text-3xl font-semibold text-(--text-primary)">
                  {ev.name}
                </h1>
                <div className="text-(--text-muted)">
                  {new Date(ev.startsAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2 rounded-2xl bg-white border border-(--border) p-6">
            <h2 className="font-semibold">About this experience</h2>
            <div className="mt-3 prose max-w-none text-(--text-primary)">
              {ev.description || "—"}
            </div>
          </article>
          <aside className="lg:col-span-1">
            <div className="rounded-2xl bg-white border border-(--border) p-6">
              <h2 className="font-semibold">Choose your ticket</h2>
              <div className="mt-4 space-y-4">
                {ticketTypes.map((t) => (
                  <form
                    key={t.id}
                    action={`/events/${slug}/checkout`}
                    method="get"
                    className="rounded-xl border border-(--border) p-4"
                  >
                    <div className="font-medium">{t.name}</div>
                    {t.description && (
                      <div className="text-sm text-(--text-muted)">
                        {t.description}
                      </div>
                    )}
                    <div className="mt-2">
                      <Price amount={t.price} currency={t.currency} />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input type="hidden" name="ticketTypeId" value={t.id} />
                      <input
                        type="number"
                        name="quantity"
                        min={1}
                        max={10}
                        defaultValue={1}
                        className="w-20 rounded-lg border border-(--border) px-3 py-2"
                      />
                      <button className="ml-auto rounded-lg bg-(--brand-primary) text-white px-3 py-2 text-sm hover:bg-(--brand-primary-hover)">
                        Select
                      </button>
                    </div>
                  </form>
                ))}
                {ticketTypes.length === 0 && (
                  <div className="text-(--text-muted)">
                    No tickets available
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
