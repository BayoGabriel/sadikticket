import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { enquirySchema } from "@/schemas/enquiry";
import { enquiryService } from "@/services/enquiryService";

// POST /api/v1/enquiries (public) - private bookings, business, waitlist, updates
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = enquirySchema.parse(json);
    const result = await enquiryService.create(input);
    return ok(result, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
