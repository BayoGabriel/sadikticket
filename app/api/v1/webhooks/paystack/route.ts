import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { paystackService } from "@/services/paystackService";
import { paymentService } from "@/services/paymentService";

// POST /api/v1/webhooks/paystack
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    if (!paystackService.isValidSignature(raw, signature)) {
      return new Response("Invalid signature", { status: 400 });
    }

    const evt = JSON.parse(raw);
    if (evt.event !== "charge.success") return ok({ received: true });

    const result = await paymentService.confirmPaystackPayment(
      evt.data.reference as string,
    );

    return ok({ processed: result.status === "PAID" });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
