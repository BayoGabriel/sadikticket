import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { adminOrderService } from "@/services/adminOrderService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { formatNaira } from "@/lib/format";

// POST /api/v1/admin/orders/:orderId/:action
//   resend · mark-paid · refund · cancel · reverify · transfer
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string; action: string }> },
) {
  try {
    const user = await requirePermission("orders");
    const { orderId, action } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    switch (action) {
      case "resend": {
        const r = await adminOrderService.resendTickets(orderId);
        return ok({ sent: r.sent });
      }
      case "mark-paid": {
        const r = await adminOrderService.markPaid(orderId, user);
        if (!r.already)
          await auditService.record({ actor: user, action: "order.marked-paid", entityType: "order", entityId: orderId });
        return ok(r);
      }
      case "refund": {
        const input = z
          .object({
            amountNaira: z.number().positive().optional(),
            reason: z.string().optional(),
          })
          .parse(body);
        const r = await adminOrderService.refund(
          orderId,
          { amountKobo: input.amountNaira ? Math.round(input.amountNaira * 100) : undefined, reason: input.reason },
          user,
        );
        await auditService.record({
          actor: user,
          action: "order.refunded",
          entityType: "order",
          entityId: orderId,
          detail: { amount: r.refunded, full: r.full, via: r.providerRefund ? "paystack" : "manual" },
        });
        revalidatePublicSite();
        return ok({ ...r, refundedLabel: formatNaira(r.refunded) });
      }
      case "cancel": {
        await adminOrderService.cancel(orderId, user);
        await auditService.record({ actor: user, action: "order.cancelled", entityType: "order", entityId: orderId });
        revalidatePublicSite();
        return ok({});
      }
      case "reverify": {
        const r = await adminOrderService.reverify(orderId);
        if (r.status === "PAID")
          await auditService.record({ actor: user, action: "order.marked-paid", entityType: "order", entityId: orderId, detail: { via: "reverify" } });
        return ok(r);
      }
      case "transfer": {
        const input = z
          .object({
            toName: z.string().optional(),
            toEmail: z.string().email().optional(),
            toEventId: z.string().optional(),
            toTicketTypeId: z.string().optional(),
          })
          .parse(body);
        await adminOrderService.transfer(orderId, input, user);
        await auditService.record({ actor: user, action: "order.transferred", entityType: "order", entityId: orderId, detail: input });
        return ok({});
      }
      default:
        return fail(new Error(`Unknown action "${action}"`));
    }
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
