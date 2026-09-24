"use client";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createOrder,
  getEventBySlug,
  initializePaystack,
  listTicketTypesBySlug,
} from "@/features/checkout/api";

export default function CheckoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const sp = useSearchParams();
  const preTicketTypeId = sp.get("ticketTypeId") || "";
  const preQty = Number(sp.get("quantity") || "1");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<
    { ticketTypeId: string; quantity: number }[]
  >(
    preTicketTypeId
      ? [{ ticketTypeId: preTicketTypeId, quantity: preQty }]
      : [],
  );

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [types, setTypes] = useState<any[]>([]);

  useMemo(() => {
    (async () => {
      const [ev, tts] = await Promise.all([
        getEventBySlug(params.slug),
        listTicketTypesBySlug(params.slug),
      ]);
      setEventDetail(ev);
      setTypes(tts);
      if (!preTicketTypeId && tts[0]) {
        setTickets([{ ticketTypeId: tts[0].id, quantity: 1 }]);
      }
    })();
  }, [params.slug]);

  const summary = useMemo(() => {
    const lines = tickets
      .map((sel) => {
        const tt = types.find((t) => t.id === sel.ticketTypeId);
        return tt
          ? {
              name: tt.name,
              unitPrice: tt.price,
              currency: tt.currency,
              quantity: sel.quantity,
            }
          : null;
      })
      .filter(Boolean) as any[];
    const total = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
    const currency = lines[0]?.currency || "NGN";
    return { lines, total, currency };
  }, [tickets, types]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!eventDetail) return;
    if (tickets.length === 0) {
      setError("Please select at least one ticket");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        eventId: eventDetail.id,
        items: tickets,
        customer: { name, email, phone: phone || undefined },
      });
      const init = await initializePaystack(order.id);
      window.location.href = init.authorizationUrl;
    } catch (e: any) {
      setError(e?.message || "Could not create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-(--surface-muted)">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 lg:grid-cols-3">
        <form
          onSubmit={onSubmit}
          className="lg:col-span-2 rounded-2xl bg-white border border-(--border) p-6 space-y-4"
        >
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-(--border) px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-(--border) px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Phone (optional)
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-(--border) px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-(--brand-primary) text-white px-4 py-2 font-medium hover:bg-(--brand-primary-hover) disabled:opacity-60"
          >
            {loading ? "Creating your order…" : "Continue to payment"}
          </button>
        </form>

        <aside className="lg:col-span-1 rounded-2xl bg-white border border-(--border) p-6">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 space-y-3">
            {summary.lines.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-(--text-muted)">
                    {l.quantity} × {l.currency} {l.unitPrice.toLocaleString()}
                  </div>
                </div>
                <div className="font-medium">
                  {l.currency} {(l.unitPrice * l.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            {summary.lines.length === 0 && (
              <div className="text-(--text-muted)">No tickets selected</div>
            )}
          </div>
          <div className="mt-4 border-t border-(--border) pt-4 flex items-center justify-between">
            <div className="text-sm text-(--text-muted)">Total</div>
            <div className="text-lg font-semibold">
              {summary.currency} {summary.total.toLocaleString()}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
