export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | string;

export type AdminEvent = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  capacity?: number;
  status: EventStatus;
  createdAt: string;
  updatedAt?: string;
  coverImage?: string | null;
};

export type TicketType = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  quantitySold?: number;
  salesStart?: string | null;
  salesEnd?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | string;
};
