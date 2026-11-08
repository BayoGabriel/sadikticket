import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/response";
import { productOrderService } from "@/services/productOrderService";
import { getPaymentProvider } from "@/services/payments";
import { env } from "@/lib/env";

const createSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(10),
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(160),
    phone: z.string().max(40).optional(),
  }),
  deliveryNote: z.string().max(500).optional(),
});

// POST /api/v1/shop/orders — creates the order and returns the Paystack URL
// to send the buyer to. One round-trip, mirrors the ticket checkout.
export async function POST(req: NextRequest) {
  try {
    const input = createSchema.parse(await req.json());
    const order = await productOrderService.create(input);

    const init = await getPaymentProvider().initializePayment({
      email: order.customerEmail,
      amountKobo: order.total,
      reference: order.paymentReference,
      currency: order.currency,
      metadata: { productOrderId: order._id.toString(), kind: "shop" },
      callback_url: `${env.APP_URL}/payment/callback`,
    });

    return ok({
      id: order._id.toString(),
      paymentReference: order.paymentReference,
      total: order.total,
      currency: order.currency,
      authorizationUrl: init.authorization_url,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
