import { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { ok, fail } from "@/lib/response";
import { ApiError } from "@/lib/errors";
import { enquirySchema } from "@/schemas/enquiry";
import { enquiryService } from "@/services/enquiryService";

// 5 enquiries per minute per IP.
const limiter = new RateLimiterMemory({ points: 5, duration: 60 });

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// POST /api/v1/enquiries (public) - private bookings, business, waitlist, updates
export async function POST(req: NextRequest) {
  try {
    await limiter.consume(clientIp(req)).catch(() => {
      throw new ApiError(
        "RATE_LIMITED",
        "Too many attempts — please try again in a minute.",
        429,
      );
    });

    const json = await req.json();

    // Honeypot: real users never fill the hidden "website" field.
    if (typeof json?.website === "string" && json.website.trim() !== "") {
      return ok({ id: null, emailed: false }, { status: 201 });
    }

    const input = enquirySchema.parse(json);
    const result = await enquiryService.create(input);
    return ok(result, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
