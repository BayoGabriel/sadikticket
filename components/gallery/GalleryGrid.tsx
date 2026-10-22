"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { Img } from "@/components/ui/Img";
import { galleryItems, galleryTypes, type GalleryItem, type GalleryType } from "@/lib/gallery";

export function GalleryGrid({ items: allItems }: { items?: GalleryItem[] }) {
  const [filter, setFilter] = useState<GalleryType | "all">("all");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const source = allItems ?? galleryItems;

  const items =
    filter === "all"
      ? source
      : source.filter((i) => i.type === filter);

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight")
        setLightbox((i) => (i === null ? null : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setLightbox((i) =>
          i === null ? null : (i - 1 + items.length) % items.length,
        );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, items.length, close]);

  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <div>
      {/* Filters */}
      <div
        className="mt-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter gallery"
      >
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
            filter === "all"
              ? "bg-[#003118] text-[#fffedd]"
              : "bg-white text-[#003118] ring-1 ring-[#003118]/15 hover:ring-[#003118]/40"
          }`}
        >
          All of it
        </button>
        {galleryTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={filter === t.value}
            onClick={() => setFilter(filter === t.value ? "all" : t.value)}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === t.value
                ? "bg-[#003118] text-[#fffedd]"
                : "bg-white text-[#003118] ring-1 ring-[#003118]/15 hover:ring-[#003118]/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Masonry-ish grid */}
      <div className="mt-8 grid grid-flow-dense grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setLightbox(i)}
            aria-label={`Open ${item.slot.alt} in lightbox`}
            className={`group relative overflow-hidden rounded-3xl text-left transition hover:-translate-y-1 ${
              item.tall ? "row-span-2 h-full" : ""
            }`}
          >
            <Img
              image={item.slot}
              rounded="rounded-none"
              className={
                item.tall ? "h-full !aspect-auto min-h-[16rem]" : ""
              }
            />
            {item.slot.video !== undefined && (
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                Video
              </span>
            )}
          </button>
        ))}
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-[#575750]">
            Nothing in this folder yet — check back soon.
          </p>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.slot.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {active.slot.video ? (
              <video
                src={active.slot.video}
                poster={active.slot.poster || active.slot.src || undefined}
                controls
                autoPlay
                muted
                loop
                className="mx-auto max-h-[75vh] w-auto rounded-2xl"
              />
            ) : active.slot.src ? (
              <div className="relative mx-auto aspect-[4/3] max-h-[75vh] w-full">
                <Image
                  src={active.slot.src}
                  alt={active.slot.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="rounded-2xl object-contain"
                />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-[#e7efe9] text-sm font-bold tracking-[0.18em] text-[#003118]/60">
                {active.slot.label}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between text-sm text-white/80">
              <span>{active.slot.alt}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((i) =>
                      i === null ? null : (i - 1 + items.length) % items.length,
                    )
                  }
                  className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
                  aria-label="Previous"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((i) =>
                      i === null ? null : (i + 1) % items.length,
                    )
                  }
                  className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
                  aria-label="Next"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
