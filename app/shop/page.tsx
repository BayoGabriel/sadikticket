import type { Metadata } from "next";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { whatsappUrl } from "@/lib/site-config";
import { contentService } from "@/services/contentService";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata: Metadata = {
  title: "Shop | SerenArt",
  description: "Take the fun home. Creative kits, merch and gift sets.",
};

// Preview tiles shown until the first product is posted in admin.
const categories = [
  {
    name: "Creative kits",
    line: "Everything you need for a session at home — supplies, guide and good vibes included.",
    img: images.shop.kits,
  },
  {
    name: "Merch",
    line: "Wear the vibe. Tees, totes and bits for people who'd rather be painting.",
    img: images.shop.merch,
  },
  {
    name: "Gift sets",
    line: "For the person who has everything — except plans. Boxed and ready to give.",
    img: images.shop.gifts,
  },
];

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await contentService.products();
  const wa = whatsappUrl("Hi SerenArt! I'd like to ask about your shop.");

  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118] sm:text-5xl">
          Shop
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4a4a45]">
          Take the fun home. Creative kits, merch and gift sets.
        </p>

        {products.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div
                  key={c.name}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm"
                >
                  <Img image={c.img} rounded="rounded-none" />
                  <div className="p-6">
                    <h2 className="font-display text-xl font-semibold text-[#003118]">
                      {c.name}
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-[#575750]">
                      {c.line}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#8a8a7d]">
              New items land here first — check back soon.
            </p>
          </>
        )}

        <div className="mt-14 rounded-[2rem] bg-[#003118] px-6 py-12 text-center sm:px-10">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Ready? Let&rsquo;s make it a date.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-orange"
              >
                Ask us about ordering
              </a>
            )}
            <Link
              href="/events"
              className="inline-flex min-h-11 items-center rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See upcoming events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
