import { NextRequest } from "next/server";
import { ok } from "@/lib/response";
import { listPublicEvents } from "@/services/eventDiscoveryService";

// GET /api/v1/events?search=&page=1&limit=12&range=today|week|month
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get("range");
  const range =
    rangeParam === "today" || rangeParam === "week" || rangeParam === "month"
      ? rangeParam
      : undefined;

  const result = await listPublicEvents({
    search: url.searchParams.get("search") ?? undefined,
    page: Number(url.searchParams.get("page") || "1"),
    limit: Number(url.searchParams.get("limit") || "12"),
    range,
  });

  return ok(result);
}
