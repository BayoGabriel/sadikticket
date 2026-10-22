import Image from "next/image";
import type { ImageSlot } from "@/lib/images";
import { cn } from "@/lib/cn";

const tintClasses: Record<NonNullable<ImageSlot["tint"]>, string> = {
  peach: "bg-[#fdd3a2] text-[#003118]/70",
  mint: "bg-[#e7efe9] text-[#003118]/60",
  green: "bg-[#0c4a2b] text-[#fffedd]/70",
  orange: "bg-[#ffe6cf] text-[#003118]/70",
  cream: "bg-[#fffedd] text-[#003118]/50",
};

const aspectClasses: Record<ImageSlot["aspect"], string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "4/5": "aspect-[4/5]",
};

// One image component for the whole site. Until a slot's `src` is filled in
// lib/images.ts it renders a labelled tinted block with the correct aspect
// ratio, so swapping in real photos never shifts the layout.
export function Img({
  image,
  className,
  sizes,
  priority,
  rounded = "rounded-3xl",
}: {
  image: ImageSlot;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
}) {
  const wrapper = cn("relative overflow-hidden", aspectClasses[image.aspect], rounded, className);

  if (image.video) {
    return (
      <div className={wrapper}>
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={image.video}
          poster={image.poster || image.src || undefined}
          muted
          loop
          playsInline
          preload="none"
          aria-label={image.alt}
        />
      </div>
    );
  }

  if (!image.src) {
    return (
      <div className={cn(wrapper, tintClasses[image.tint ?? "mint"])}>
        <span className="absolute inset-0 grid place-items-center p-4 text-center text-[11px] font-bold tracking-[0.18em]">
          {image.label}
        </span>
        <span className="sr-only">{image.alt}</span>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
