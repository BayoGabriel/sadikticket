import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { connectDb } from "@/lib/db";
import { EnquiryModel, type Enquiry } from "@/models/enquiry";

// GET /api/v1/admin/enquiries?kind=private-booking|business|waitlist|updates&format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("enquiries");
    await connectDb();
    const sp = new URL(req.url).searchParams;

    const query: Record<string, unknown> = {};
    if (sp.get("kind")) query.kind = sp.get("kind");

    const items = await EnquiryModel.find(query)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean<Enquiry[]>();

    const rows = items.map((e) => ({
      id: String(e._id),
      kind: e.kind,
      name: e.name ?? "",
      email: e.email,
      phone: e.phone ?? "",
      company: e.company ?? "",
      occasion: e.occasion ?? "",
      eventName: e.eventName ?? "",
      city: e.city ?? "",
      createdAt: e.createdAt?.toISOString?.() ?? "",
    }));

    if (sp.get("format") === "csv") {
      return csvResponse(
        toCsv(rows, [
          { key: "kind", label: "Kind" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "company", label: "Company" },
          { key: "occasion", label: "Occasion" },
          { key: "eventName", label: "Event" },
          { key: "city", label: "City" },
          { key: "createdAt", label: "Created" },
        ]),
        `enquiries-${sp.get("kind") ?? "all"}.csv`,
      );
    }

    return ok({ items: rows });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
