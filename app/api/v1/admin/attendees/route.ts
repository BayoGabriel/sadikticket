import { NextRequest } from "next/server";
import { format } from "date-fns";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { checkinService } from "@/services/checkinService";
import { toCsv, csvResponse } from "@/lib/csv";

// GET /api/v1/admin/attendees?event=<id>&format=csv|json — printable/exportable.
export async function GET(req: NextRequest) {
  try {
    await requirePermission("checkin").catch(() => requirePermission("orders"));
    const sp = req.nextUrl.searchParams;
    const eventId = sp.get("event");
    if (!eventId) return fail(new Error("event required"));
    const state = await checkinService.eventState(eventId, sp.get("q") || undefined);

    if (sp.get("format") === "csv") {
      const rows = state.attendees.map((a) => ({
        code: a.code,
        name: a.name,
        email: a.email,
        phone: a.phone,
        type: a.type,
        status: a.status,
        checkedInAt: a.checkedInAt ? format(new Date(a.checkedInAt), "yyyy-MM-dd HH:mm") : "",
      }));
      return csvResponse(
        toCsv(rows, [
          { key: "code", label: "Ticket code" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "type", label: "Ticket type" },
          { key: "status", label: "Status" },
          { key: "checkedInAt", label: "Checked in" },
        ]),
        "attendees.csv",
      );
    }
    return ok(state);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
