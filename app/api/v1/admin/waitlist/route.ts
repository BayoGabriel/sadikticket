import { NextRequest } from "next/server";
import { z } from "zod";
import { format } from "date-fns";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { waitlistService } from "@/services/waitlistService";
import { auditService } from "@/services/auditService";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/v1/admin/waitlist?event=&status=&format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("waitlist");
    const sp = req.nextUrl.searchParams;
    const items = await waitlistService.list(sp.get("event") || undefined, sp.get("status") || undefined);

    if (sp.get("format") === "csv") {
      return csvResponse(
        toCsv(
          items.map((w) => ({
            name: w.name,
            email: w.email,
            phone: w.phone ?? "",
            event: w.eventName,
            status: w.status,
            joined: format(new Date(w.createdAt), "yyyy-MM-dd HH:mm"),
            notifiedAt: w.notifiedAt ? format(new Date(w.notifiedAt), "yyyy-MM-dd HH:mm") : "",
          })),
          [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "event", label: "Event" },
            { key: "status", label: "Status" },
            { key: "joined", label: "Joined" },
            { key: "notifiedAt", label: "Notified" },
          ],
        ),
        "waitlist.csv",
      );
    }

    return ok({
      items: items.map((w) => ({
        id: String(w._id),
        name: w.name,
        email: w.email,
        phone: w.phone ?? "",
        eventId: String(w.eventId),
        eventName: w.eventName,
        status: w.status,
        notifiedAt: w.notifiedAt,
        createdAt: w.createdAt,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("notify"), eventId: z.string().min(1), count: z.number().int().positive().optional() }),
  z.object({ action: z.literal("remove"), ids: z.array(z.string()).min(1) }),
]);

// POST /api/v1/admin/waitlist — notify next N people, or remove entries.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("waitlist");
    const input = postSchema.parse(await req.json());
    if (input.action === "notify") {
      const r = await waitlistService.notify(input.eventId, input.count);
      await auditService.record({
        actor: user,
        action: "waitlist.notified",
        entityType: "event",
        entityId: input.eventId,
        detail: { count: r.notified },
      });
      return ok(r);
    }
    await waitlistService.remove(input.ids);
    await auditService.record({
      actor: user,
      action: "waitlist.removed",
      entityType: "waitlist",
      entityId: input.ids[0],
      detail: { count: input.ids.length },
    });
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
