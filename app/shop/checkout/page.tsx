"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatNaira } from "@/lib/format";

type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  inStock: boolean;
};

const inputCls =
  "mt-1 w-full rounded-lg border border-(--border) px-3 py-2 focus:outline-none focus:ring-2 focus:ring-(--brand-primary)";

function ShopCheckoutInner() {
  const sp = useSearchParams();
  const productId = sp.get("product") || "";

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [qty, setQty] = useState(Math.max(1, Number(sp.get("qty")) || 1));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/shop/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const items = (d?.data?.items ?? []) as ShopProduct[];
        setProduct(items.find((p) => p.id === productId) ?? null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoaded(true));
  }, [productId]);

  const total = useMemo(
    () => (product ? product.price * qty : 0),
    [product, qty],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!product) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: product.id, quantity: qty }],
          customer: { name, email, phone: phone || undefined },
          deliveryNote: deliveryNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.error?.message || "Could not create your order");
      window.location.href = data.data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order");
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
            {product
              ? `${product.name} — where should we send your order?`
              : loaded
                ? "That item isn't available anymore."
                : "Loading item…"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone (optional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">
                Delivery / pickup note (optional)
              </label>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
                placeholder="Address, preferred pickup spot, anything that helps us get it to you."
                className={inputCls}
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center gap-4">
            <button
              disabled={loading || !product || !product.inStock}
              className="inline-flex items-center rounded-full bg-[#f27a00] px-6 py-3 font-semibold text-white transition hover:bg-[#d56c00] disabled:opacity-60"
            >
              {loading ? "Creating your order…" : "Pay now"}
            </button>
            <Link
              href="/shop"
              className="text-sm font-medium text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
            >
              Back to the shop
            </Link>
          </div>
          <p className="text-xs text-[#85857d]">
            Secure checkout via Paystack. Your receipt lands in your email.
          </p>
        </form>

        <aside className="rounded-2xl border border-(--border) bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold text-[#003118]">Order summary</h2>
          {product ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-(--text-muted)">
                    {formatNaira(product.price)} each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="One fewer"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-full border border-(--border) font-bold hover:bg-(--surface-muted)"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{qty}</span>
                  <button
                    type="button"
                    aria-label="One more"
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    className="h-8 w-8 rounded-full border border-(--border) font-bold hover:bg-(--surface-muted)"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-(--border) pt-4">
                <div className="text-sm text-(--text-muted)">Total</div>
                <div className="text-lg font-semibold text-[#003118]">
                  {formatNaira(total)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-(--text-muted)">
              {loaded ? (
                <>
                  Nothing selected —{" "}
                  <Link href="/shop" className="font-medium text-[#003118] underline">
                    pick an item
                  </Link>
                  .
                </>
              ) : (
                "Loading…"
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default function ShopCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <ShopCheckoutInner />
    </Suspense>
  );
}
