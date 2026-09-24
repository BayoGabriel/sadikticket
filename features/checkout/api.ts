import { EventSummary } from "@/features/events/types";

export type PublicEventDetail = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  venueName?: string;
  venueAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  startsAt: string;
  endsAt?: string;
  timezone?: string;
  coverImage?: string | null;
};

export type PublicTicketType = {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity?: number;
  quantitySold?: number;
  salesStart?: string | null;
  salesEnd?: string | null;
  status: string;
};

// Server-aware request: absolute URL + forwarded cookies on server, relative on client
async function makeRequest(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  if (typeof window !== "undefined") return fetch(path, init);
  const { headers: nextHeaders, cookies: nextCookies } =
    await import("next/headers");
  const h = await nextHeaders();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const absolute = new URL(path, base).toString();
  const cookieStore = await nextCookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const headers = new Headers(init?.headers);
  if (cookieHeader) headers.set("cookie", cookieHeader);
  return fetch(absolute, { ...init, headers });
}

export async function getEventBySlug(
  slug: string,
): Promise<PublicEventDetail | null> {
  const res = await makeRequest(`/api/v1/events/${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success) return null;
  return data.data as PublicEventDetail;
}

export async function getOrderStatusByReference(reference: string) {
  const res = await fetch(
    `/api/v1/orders/by-reference/${encodeURIComponent(reference)}/status`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to load order status");
  return data.data as import("./types").OrderStatusPayload;
}

export function ticketsUrlForOrder(orderId: string) {
  return `/tickets/${orderId}`;
}

export async function listTicketTypesBySlug(
  slug: string,
): Promise<PublicTicketType[]> {
  const res = await makeRequest(`/api/v1/events/${slug}/ticket-types`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success) return [];
  return data.data.items as PublicTicketType[];
}

export async function createOrder(input: {
  eventId: string;
  items: { ticketTypeId: string; quantity: number }[];
  customer: { name: string; email: string; phone?: string };
}): Promise<{
  id: string;
  total: number;
  currency: string;
  paymentReference: string;
}> {
  const res = await fetch("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to create order");
  return data.data;
}

export async function initializePaystack(
  orderId: string,
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch("/api/v1/payments/paystack/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to initialize payment");
  return data.data;
}
