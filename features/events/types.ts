export type EventSummary = {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  city?: string;
  country?: string;
  venueName?: string;
  startsAt: string | Date;
  fromPrice?: number;
};
