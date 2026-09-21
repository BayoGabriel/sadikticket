import { listPublicEvents } from "@/services/eventDiscoveryService";
import { EventSummary } from "./types";

export async function getFeaturedEvents(): Promise<EventSummary[]> {
  const result = await listPublicEvents({ limit: 6 });
  return result.items;
}

export async function getEvents(params: {
  search?: string;
  page?: number;
  limit?: number;
  range?: "today" | "week" | "month";
}): Promise<{
  items: EventSummary[];
  page: number;
  total: number;
  totalPages: number;
}> {
  const result = await listPublicEvents(params);
  return {
    items: result.items,
    page: result.page,
    total: result.total,
    totalPages: result.totalPages,
  };
}
