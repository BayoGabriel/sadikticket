import { NextRequest } from "next/server";
import { z } from "zod";
import { format } from "date-fns";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { subscriberService } from "@/services/subscriberService";
import { connectDb } from "@/lib/db";
import { SubscriberModel } from "@/models/subscriber";
import { auditService } from "@/services/auditService";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/v1/admin/subscribers?q=&city=&source=&status=&page=&format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("subscribers");
    const sp = req.nextUrl.searchParams;
    const result = await subscriberService.list({
      q: sp.get("q") || undefined,
      city: sp.get("city") || undefined,
      source: sp.get("source") || undefined,
      status: sp.get("status") || undefined,
      page: Math.max(1, Number(sp.get("page") || 1)),
      limit: Math.min(500, Number(sp.get("limit") || 25)),
    });

    if (sp.get("format") === "csv") {
      return csvResponse(
        toCsv(
          result.items.map((s) => ({
            email: s.email,
            city: s.city ?? "",
            source: s.source,
            status: s.status,
            joined: format(new Date(s.createdAt), "yyyy-MM-dd HH:mm"),
          })),
          [
            { key: "email", label: "Email" },
            { key: "city", label: "City" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status" },
            { key: "joined", label: "Joined" },
          ],
        ),
        "subscribers.csv",
      );
    }

    return ok({
      ...result,
      items: result.items.map((s) => ({
        id: String(s._id),
        email: s.email,
        city: s.city ?? "",
        source: s.source,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("import"),
    rows: z.array(z.object({ email: z.string(), city: z.string().optional(), source: z.string().optional() })).min(1),
  }),
  z.object({
    action: z.literal("broadcast"),
    eventId: z.string().min(1),
    city: z.string().optional(),
    subject: z.string().optional(),
    intro: z.string().optional(),
  }),
  z.object({ action: z.literal("remove"), ids: z.array(z.string()).min(1) }),
  z.object({ action: z.literal("unsubscribe"), id: z.string() }),
]);

// POST /api/v1/admin/subscribers — import / broadcast / remove / unsubscribe.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("subscribers");
    const input = postSchema.parse(await req.json());
    switch (input.action) {
      case "import": {
        const added = await subscriberService.importRows(input.rows);
        await auditService.record({
          actor: user,
          action: "subscribers.imported",
          entityType: "subscriber",
          detail: { added, total: input.rows.length },
        });
        return ok({ added });
      }
      case "broadcast": {
        const r = await subscriberService.broadcast(input);
        await auditService.record({
          actor: user,
          action: "subscribers.broadcast",
          entityType: "event",
          entityId: input.eventId,
          detail: { sent: r.sent, city: input.city },
        });
        return ok(r);
      }
      case "remove": {
        await subscriberService.remove(input.ids);
        return ok({});
      }
      case "unsubscribe": {
        await connectDb();
        await SubscriberModel.updateOne({ _id: input.id }, { $set: { status: "unsubscribed", unsubscribedAt: new Date() } });
        return ok({});
      }
    }
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
