"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createOrder,
  getEventBySlug,
  initializePaystack,
  listTicketTypesBySlug,
} from "@/features/checkout/api";

function parseItems(
  sp: URLSearchParams,
): { ticketTypeId: string; quantity: number }[] {
  const items = sp.get("items");
  if (items) {
    return items
      .split(",")
      .map((pair) => {
        const [ticketTypeId, q] = pair.split(":");
        return { ticketTypeId, quantity: Math.max(1, Number(q) || 1) };
      })
      .filter((i) => i.ticketTypeId);
  }
  const ticketTypeId = sp.get("ticketTypeId");
  if (ticketTypeId) {
    return [
      { ticketTypeId, quantity: Math.max(1, Number(sp.get("quantity")) || 1) },
    ];
  }
  return [];
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const sp = useSearchParams();
  const coupon = sp.get("coupon") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tickets] = useState<{ ticketTypeId: string; quantity: number }[]>(
    () => parseItems(sp),
  );

  const [eventDetail, setEventDetail] = useState<any | null>(null);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [ev, tts] = await Promise.all([
        getEventBySlug(slug),
        listTicketTypesBySlug(slug),
      ]);
      setEventDetail(ev);
      setTypes(tts);
    })();
  }, [slug]);

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
        couponCode: coupon || undefined,
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
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-(--border) bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h1 className="text-2xl font-semibold text-[#003118]">
            Almost there
          </h1>
          <p className="text-sm text-[#6b6b6b]">
            {eventDetail
              ? `${eventDetail.name} — where should we send your ticket?`
              : "Loading event…"}
          </p>
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
          <div className="flex items-center gap-4">
            <button
              disabled={loading}
              className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 font-semibold text-white transition hover:bg-[#d56c00] disabled:opacity-60"
            >
              {loading ? "Creating your order…" : "Get my ticket"}
            </button>
            <Link
              href={`/events/${slug}`}
              className="text-sm font-medium text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
            >
              Back to event
            </Link>
          </div>
          <p className="text-xs text-[#85857d]">
            Secure checkout. Your ticket lands in your email.
          </p>
        </form>

        <aside className="rounded-2xl border border-(--border) bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold text-[#003118]">Order summary</h2>
          <div className="mt-4 space-y-3">
            {summary.lines.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-(--text-muted)">
                    {l.quantity} × {l.currency === "NGN" ? "₦" : l.currency}{" "}
                    {(l.unitPrice / 100).toLocaleString()}
                  </div>
                </div>
                <div className="font-medium">
                  {l.currency === "NGN" ? "₦" : l.currency}{" "}
                  {((l.unitPrice * l.quantity) / 100).toLocaleString()}
                </div>
              </div>
            ))}
            {summary.lines.length === 0 && (
              <div className="text-(--text-muted)">
                No tickets selected —{" "}
                <Link
                  href={`/events/${slug}`}
                  className="font-medium text-[#003118] underline"
                >
                  pick your tickets
                </Link>
                .
              </div>
            )}
          </div>
          {coupon && (
            <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-4 text-sm">
              <span className="text-(--text-muted)">Code</span>
              <span className="font-medium text-[#003118]">{coupon}</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-(--border) pt-4">
            <div className="text-sm text-(--text-muted)">Total</div>
            <div className="text-lg font-semibold text-[#003118]">
              {summary.currency === "NGN" ? "₦" : summary.currency}{" "}
              {(summary.total / 100).toLocaleString()}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
