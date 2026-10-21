export type EventStatusTag =
  | "on-sale"
  | "few-left"
  | "sold-out"
  | "coming-soon";

export type EventSummary = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  shortDescription?: string;
  city?: string;
  country?: string;
  venueName?: string;
  startsAt: string | Date;
  fromPrice?: number;
  currency?: string;
  statusTag?: EventStatusTag;
};
