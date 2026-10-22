import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { subscriberService } from "@/services/subscriberService";

// GET /api/v1/subscribers/unsubscribe?email=&sig= — link from every
// broadcast email. Signed so it can't unsubscribe arbitrary emails.
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const email = sp.get("email") ?? "";
    const sig = sp.get("sig") ?? "";
    if (!email || !sig) return fail(new Error("Missing link details."));
    const done = await subscriberService.unsubscribe(email, sig);
    if (!done) return fail(new Error("That link doesn't look right."));
    return ok({ unsubscribed: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
