import { NextRequest } from "next/server";
import { format } from "date-fns";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { enquiryPipelineService } from "@/services/enquiryPipelineService";

// GET /api/v1/admin/enquiries?tab=&stage=&city=&owner=&q=&from=&to=&format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("enquiries");
    const sp = req.nextUrl.searchParams;
    const items = await enquiryPipelineService.list({
      tab: sp.get("tab") || undefined,
      stage: sp.get("stage") || undefined,
      city: sp.get("city") || undefined,
      owner: sp.get("owner") || undefined,
      q: sp.get("q") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
    });

    const rows = items.map((e) => ({
      id: String(e._id),
      kind: e.kind,
      name: e.name ?? "",
      email: e.email,
      phone: e.phone ?? "",
      company: e.company ?? "",
      occasion: e.occasion ?? "",
      experience: e.experience ?? "",
      service: e.service ?? "",
      date: e.date ?? "",
      guests: e.guests ?? e.size ?? "",
      location: e.location ?? e.city ?? "",
      frequency: e.frequency ?? "",
      message: e.message ?? e.extra ?? e.goals ?? "",
      eventName: e.eventName ?? "",
      stage: e.stage,
      read: e.read,
      ownerId: e.ownerId ? String(e.ownerId) : "",
      ownerName: e.ownerName ?? "",
      followUpAt: e.followUpAt ?? null,
      quoteAmount: e.quoteAmount ?? null,
      booking: e.booking ?? null,
      notes: (e.notes ?? []).map((n) => ({ text: n.text, author: n.author, createdAt: n.createdAt })),
      createdAt: e.createdAt,
      ageHours: e.ageHours,
    }));

    if (sp.get("format") === "csv") {
      return csvResponse(
        toCsv(
          rows.map((r) => ({
            ...r,
            quoteAmount: r.quoteAmount ? r.quoteAmount / 100 : "",
            createdAt: format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"),
            followUpAt: r.followUpAt ? format(new Date(r.followUpAt), "yyyy-MM-dd") : "",
          })),
          [
            { key: "kind", label: "Kind" },
            { key: "stage", label: "Stage" },
            { key: "name", label: "Name" },
            { key: "company", label: "Company" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "occasion", label: "Occasion" },
            { key: "service", label: "Service" },
            { key: "date", label: "Date" },
            { key: "guests", label: "Guests" },
            { key: "location", label: "Location" },
            { key: "quoteAmount", label: "Quote ₦" },
            { key: "ownerName", label: "Owner" },
            { key: "followUpAt", label: "Follow up" },
            { key: "message", label: "Message" },
            { key: "createdAt", label: "Received" },
          ],
        ),
        `enquiries-${sp.get("tab") ?? "all"}.csv`,
      );
    }

    return ok({ items: rows });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
