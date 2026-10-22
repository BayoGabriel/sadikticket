"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PublicTicketType } from "@/features/checkout/api";
import { NotifyForm } from "@/components/forms/NotifyForm";
import { whatsappUrl } from "@/lib/site-config";

function Price({ amount, currency }: { amount: number; currency: string }) {
  const major = Math.round(amount) / 100;
  const symbol = currency === "NGN" ? "₦" : `${currency} `;
  return (
    <span className="font-semibold tracking-tight">
      {symbol}
      {major.toLocaleString(undefined, { minimumFractionDigits: 0 })}
    </span>
  );
}

export function TicketPicker({
  slug,
  eventName,
  ticketTypes,
}: {
  slug: string;
  eventName: string;
  ticketTypes: PublicTicketType[];
}) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const now = new Date();
  const rows = ticketTypes.map((t) => {
    const available =
      typeof t.quantityAvailable === "number" ? t.quantityAvailable : undefined;
    const startsInFuture = t.salesStart ? new Date(t.salesStart) > now : false;
    const endedAlready = t.salesEnd ? new Date(t.salesEnd) < now : false;
    const onSale = t.isOnSale !== false && !startsInFuture && !endedAlready;
    const soldOut = onSale && available !== undefined && available <= 0;
    const max = Math.max(0, Math.min(10, available ?? 10));
    return { t, available, onSale, soldOut, max };
  });

  const allSoldOut =
    rows.length > 0 && rows.every((r) => r.soldOut || !r.onSale);

  const total = useMemo(
    () =>
      rows.reduce(
        (acc, r) => acc + (qty[r.t.id] || 0) * r.t.price,
        0,
      ),
    [rows, qty],
  );
  const currency = rows[0]?.t.currency || "NGN";

  const set = (id: string, v: number, max: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(max, v)) }));

  const checkout = () => {
    const items = Object.entries(qty)
      .filter(([, q]) => q > 0)
      .map(([ticketTypeId, quantity]) => `${ticketTypeId}:${quantity}`)
      .join(",");
    if (!items) return;
    const params = new URLSearchParams({ items });
    if (appliedCoupon) params.set("coupon", appliedCoupon);
    router.push(`/events/${slug}/checkout?${params.toString()}`);
  };

  if (rows.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <h3 className="font-semibold text-[#003118]">
          Tickets aren’t available yet
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#77776F]">
          Leave your email and we’ll tell you the moment tickets go live.
        </p>
        <NotifyForm
          kind="waitlist"
          eventSlug={slug}
          eventName={eventName}
          buttonLabel="Join the waitlist"
          successMessage="Done. If a ticket frees up, you'll hear from us first."
          className="mx-auto mt-4 max-w-xs"
        />
      </div>
    );
  }

  if (allSoldOut) {
    return (
      <div className="px-3 py-8 text-center">
        <h3 className="font-semibold text-[#003118]">Sold out</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#77776F]">
          This one went fast. Join the waitlist and you’ll hear from us first if
          a ticket frees up.
        </p>
        <NotifyForm
          kind="waitlist"
          eventSlug={slug}
          eventName={eventName}
          buttonLabel="Join the waitlist"
          successMessage="Done. If a ticket frees up, you'll hear from us first."
          className="mx-auto mt-4 max-w-xs"
        />
      </div>
    );
  }

  const wa = whatsappUrl(`Hi SerenArt! I have a question about ${eventName}.`);

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#85857D]">
        How many of you?
      </div>
      <div className="space-y-3">
        {rows.map(({ t, available, onSale, soldOut, max }) => (
          <div
            key={t.id}
            className="rounded-2xl border border-[#E8E7E1] bg-[#fffdf0] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-[#003118]">{t.name}</h3>
                {t.description && (
                  <p className="mt-1 text-sm leading-5 text-[#77776F]">
                    {t.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right text-[#003118]">
                <div className="text-lg">
                  <Price amount={t.price} currency={t.currency} />
                </div>
                <div className="text-[11px] text-[#85857D]">
                  {soldOut
                    ? "Sold out"
                    : !onSale && t.salesStart
                      ? `Sales start ${new Date(t.salesStart).toLocaleDateString()}`
                      : !onSale
                        ? "Not on sale"
                        : available !== undefined
                          ? `${available} left`
                          : "per person"}
                </div>
              </div>
            </div>

            {(onSale || soldOut) && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`One less ${t.name}`}
                  disabled={soldOut || !onSale || (qty[t.id] || 0) <= 0}
                  onClick={() => set(t.id, (qty[t.id] || 0) - 1, max)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCDCD5] bg-white text-lg font-semibold text-[#003118] transition hover:border-[#003118]/40 disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-[#003118]">
                  {qty[t.id] || 0}
                </span>
                <button
                  type="button"
                  aria-label={`One more ${t.name}`}
                  disabled={soldOut || !onSale || (qty[t.id] || 0) >= max}
                  onClick={() => set(t.id, (qty[t.id] || 0) + 1, max)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCDCD5] bg-white text-lg font-semibold text-[#003118] transition hover:border-[#003118]/40 disabled:opacity-40"
                >
                  +
                </button>
                {soldOut && (
                  <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-[#85857D]">
                    Sold out
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="mt-4">
        {!couponOpen ? (
          <button
            type="button"
            onClick={() => setCouponOpen(true)}
            className="text-sm font-medium text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            Got a code? Pop it in here
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Your code"
              className="min-w-0 flex-1 rounded-xl border border-[#DCDCD5] bg-white px-3 py-2 text-sm text-[#003118] outline-none focus:border-[#003118]/40"
            />
            <button
              type="button"
              onClick={() => setAppliedCoupon(coupon.trim())}
              className="rounded-xl border border-[#003118]/25 px-4 py-2 text-sm font-semibold text-[#003118] transition hover:bg-[#e6eeeb]"
            >
              Apply
            </button>
          </div>
        )}
        {appliedCoupon && (
          <p className="mt-2 text-xs text-[#6b6b6b]">
            Code “{appliedCoupon}” will be checked at checkout.
          </p>
        )}
      </div>

      {/* Total + CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-[#EEEDE8] pt-4">
        <span className="text-sm text-[#6b6b6b]">Total</span>
        <span className="text-lg font-semibold text-[#003118]">
          <Price amount={total} currency={currency} />
        </span>
      </div>
      <button
        type="button"
        onClick={checkout}
        disabled={total <= 0}
        className="mt-3 w-full rounded-xl bg-[#f27a00] py-3.5 text-sm font-semibold text-white transition hover:bg-[#d56c00] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Get my ticket
      </button>

      <div className="mt-4 space-y-2 text-center">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            Questions? Chat on WhatsApp
          </a>
        )}
        <p className="text-xs leading-5 text-[#85857D]">
          Secure checkout. Your ticket lands in your email.
        </p>
      </div>
    </div>
  );
}
