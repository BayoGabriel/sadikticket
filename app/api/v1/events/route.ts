import { NextRequest } from "next/server";
import { ok } from "@/lib/response";
import { listPublicEvents } from "@/services/eventDiscoveryService";

// GET /api/v1/events?search=&page=1&limit=12&range=today|week|month&city=&month=YYYY-MM
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
    city: url.searchParams.get("city") ?? undefined,
    month: url.searchParams.get("month") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    upcomingOnly: url.searchParams.get("upcomingOnly") !== "false",
  });

  return ok(result);
}
