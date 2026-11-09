"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Img } from "@/components/ui/Img";
import { images } from "@/lib/images";
import { formatNaira } from "@/lib/format";

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number; // kobo
  images: string[];
  inStock: boolean;
};

export function ProductCard({
  product,
  className = "",
}: {
  product: ShopProduct;
  className?: string;
}) {
  const photos = product.images.filter(Boolean);
  const [idx, setIdx] = useState(0);
  const current = photos[Math.min(idx, Math.max(0, photos.length - 1))];

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {current ? (
          <Image
            src={current}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <Img image={images.shop.kits} className="absolute inset-0 !aspect-auto" />
        )}

        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-[#3d3d38] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
            Sold out
          </span>
        )}

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 font-bold text-[#003118] opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIdx((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 font-bold text-[#003118] opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
            >
              ›
            </button>
            <span className="absolute bottom-2 right-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white">
              {Math.min(idx + 1, photos.length)}/{photos.length}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-[#003118]">
            {product.name}
          </h3>
          <span className="shrink-0 font-display text-lg font-semibold text-[#f27a00]">
            {formatNaira(product.price)}
          </span>
        </div>
        {product.description && (
          <p className="mt-1.5 text-sm leading-6 text-[#575750]">
            {product.description}
          </p>
        )}
        {product.inStock ? (
          <Link
            href={`/shop/checkout?product=${product.id}`}
            className="btn btn-orange mt-4 self-start !min-h-0 px-5 py-2.5 text-sm"
          >
            Buy this
          </Link>
        ) : (
          <span className="mt-4 self-start rounded-full bg-[#e7efe9] px-5 py-2.5 text-sm font-bold text-[#003118]/50">
            Sold out
          </span>
        )}
      </div>
    </div>
  );
}
