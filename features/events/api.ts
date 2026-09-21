import { EventSummary } from './types';

const BASE = '/api/v1';

export async function fetchFeaturedEvents(): Promise<EventSummary[]> {
  const res = await fetch(`${BASE}/events?limit=6`, { next: { revalidate: 60 } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error('Failed to load featured events');
  return data.data.items;
}

export async function fetchEvents(params: { search?: string; page?: number; limit?: number; range?: 'today' | 'week' | 'month'; }): Promise<{ items: EventSummary[]; page: number; total: number; totalPages: number; }>{
  const url = new URL(`${BASE}/events`, 'http://localhost');
  if (params.search) url.searchParams.set('search', params.search);
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.range) url.searchParams.set('range', params.range);
  const res = await fetch(`${url.pathname}${url.search}`, { next: { revalidate: 30 } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error('Failed to load events');
  return data.data;
}
