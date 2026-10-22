import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { checkinService } from "@/services/checkinService";
import { auditService } from "@/services/auditService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";

// GET /api/v1/admin/check-in?event=<id>&q= — live counter + attendee list.
//    /api/v1/admin/check-in?today=1 — today's + upcoming published events.
export async function GET(req: NextRequest) {
  try {
    await requirePermission("checkin");
    const sp = req.nextUrl.searchParams;
    if (sp.get("today")) {
      await connectDb();
      const [today, upcoming] = await Promise.all([
        checkinService.todaysEvents(),
        EventModel.find({ status: "PUBLISHED", startsAt: { $gte: new Date() } })
          .sort({ startsAt: 1 })
          .limit(10)
          .lean(),
      ]);
      const list = today.length ? today : upcoming;
      return ok({
        events: list.map((e) => ({ id: String(e._id), name: e.name, startsAt: e.startsAt, venueName: e.venueName, city: e.city })),
      });
    }
    const eventId = sp.get("event");
    if (!eventId) return fail(new Error("event required"));
    return ok(await checkinService.eventState(eventId, sp.get("q") || undefined));
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const scanSchema = z.object({
  eventId: z.string().min(1),
  token: z.string().min(1),
});

// POST /api/v1/admin/check-in  { eventId, token } — scan or typed code.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("checkin");
    const { eventId, token } = scanSchema.parse(await req.json());
    const result = await checkinService.scan(token, eventId, user);
    if (result.ok) {
      await auditService.record({
        actor: user,
        action: "checkin.scanned",
        entityType: "ticket",
        entityId: token.slice(0, 12),
        entityLabel: result.name,
        detail: { eventId },
      });
    }
    return ok(result);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
