export type AdminEventSummary = {
  id: string;
  name: string;
  slug: string;
  startsAt?: string;
  endsAt?: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | string;
  createdAt: string;
};

export type AdminEventList = {
  items: AdminEventSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listEvents(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: string;
}): Promise<AdminEventList> {
  const url = new URL("/api/v1/admin/events", "http://localhost");
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.search) url.searchParams.set("search", params.search);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.order) url.searchParams.set("order", params.order);
  const res = await fetch(`${url.pathname}${url.search}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to load events");
  return data.data as AdminEventList;
}

export async function getEvent(eventId: string): Promise<any> {
  const res = await fetch(`/api/v1/admin/events/${eventId}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to load event");
  return data.data;
}

export async function updateEvent(eventId: string, patch: any): Promise<any> {
  const res = await fetch(`/api/v1/admin/events/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to update event");
  return data.data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/events/${eventId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || "Failed to delete event");
  }
}

export async function publishEvent(eventId: string): Promise<any> {
  const res = await fetch(`/api/v1/admin/events/${eventId}/publish`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to publish");
  return data.data;
}

export async function unpublishEvent(eventId: string): Promise<any> {
  const res = await fetch(`/api/v1/admin/events/${eventId}/unpublish`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to unpublish");
  return data.data;
}

export async function cancelEvent(eventId: string): Promise<any> {
  const res = await fetch(`/api/v1/admin/events/${eventId}/cancel`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to cancel");
  return data.data;
}

export async function listTicketTypes(
  eventId: string,
  page = 1,
  limit = 50,
): Promise<{
  items: any[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> {
  const url = new URL(
    `/api/v1/admin/events/${eventId}/ticket-types`,
    "http://localhost",
  );
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  const res = await fetch(`${url.pathname}${url.search}`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to load ticket types");
  return data.data;
}

export async function getTicketType(
  eventId: string,
  ticketTypeId: string,
): Promise<any> {
  const res = await fetch(
    `/api/v1/admin/events/${eventId}/ticket-types/${ticketTypeId}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to load ticket type");
  return data.data;
}

export async function createTicketType(
  eventId: string,
  input: any,
): Promise<{ id: string }> {
  const res = await fetch(`/api/v1/admin/events/${eventId}/ticket-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to create ticket type");
  return data.data;
}

export async function updateTicketType(
  eventId: string,
  ticketTypeId: string,
  patch: any,
): Promise<any> {
  const res = await fetch(
    `/api/v1/admin/events/${eventId}/ticket-types/${ticketTypeId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    },
  );
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to update ticket type");
  return data.data;
}

export async function deleteTicketType(
  eventId: string,
  ticketTypeId: string,
): Promise<void> {
  const res = await fetch(
    `/api/v1/admin/events/${eventId}/ticket-types/${ticketTypeId}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || "Failed to delete ticket type");
  }
}

export async function createEvent(
  input: any,
): Promise<{ id: string; slug: string; status: string }> {
  const res = await fetch("/api/v1/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || "Failed to create event");
  return data.data;
}
