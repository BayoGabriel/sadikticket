// Gallery items — photos and short videos from past events, each tagged
// with a `type` for the filter chips on /gallery. Point `src`/`video` at
// real files in /public/images (or /public/videos) when they're supplied.

import { images, type ImageSlot } from "@/lib/images";

export type GalleryType =
  | "painting"
  | "karaoke"
  | "picnic"
  | "pottery"
  | "private-party"
  | "team-day";

export const galleryTypes: { value: GalleryType; label: string }[] = [
  { value: "painting", label: "Painting" },
  { value: "karaoke", label: "Karaoke" },
  { value: "picnic", label: "Picnic" },
  { value: "pottery", label: "Pottery" },
  { value: "private-party", label: "Private party" },
  { value: "team-day", label: "Team day" },
];

export type GalleryItem = {
  key: string;
  type: GalleryType;
  slot: ImageSlot;
  tall?: boolean; // spans two rows in the masonry grid
};

const g = (key: keyof typeof images.gallery) => images.gallery[key];

export const galleryItems: GalleryItem[] = [
  { key: "g1", type: "painting", slot: { ...g("g1"), label: "PHOTO · PAINTING NIGHT" }, tall: true },
  { key: "g2", type: "karaoke", slot: { ...g("g2"), label: "PHOTO · KARAOKE" } },
  { key: "g3", type: "picnic", slot: { ...g("g3"), label: "VIDEO · PICNIC DAY", video: "" } },
  { key: "g4", type: "private-party", slot: { ...g("g4"), label: "PHOTO · PRIVATE PARTY" } },
  { key: "g5", type: "team-day", slot: { ...g("g5"), label: "PHOTO · TEAM DAY" } },
  { key: "g6", type: "pottery", slot: { ...g("g6"), label: "VIDEO · POTTERY", video: "" } },
  { key: "g7", type: "painting", slot: { ...g("g7"), label: "PHOTO · SIP AND PAINT" } },
  { key: "g8", type: "private-party", slot: { ...g("g8"), label: "PHOTO · BRIDAL SHOWER" } },
  { key: "g9", type: "karaoke", slot: { ...g("g9"), label: "VIDEO · RNB NIGHT", video: "" }, tall: true },
  { key: "g10", type: "painting", slot: { ...g("g10"), label: "PHOTO · CANVAS NIGHT" } },
  { key: "g11", type: "team-day", slot: { ...g("g11"), label: "PHOTO · OFFSITE" } },
  { key: "g12", type: "pottery", slot: { ...g("g12"), label: "PHOTO · CLAY DAY" } },
];
