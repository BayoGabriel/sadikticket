import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { adminOrderService } from "@/services/adminOrderService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

const manualSaleSchema = z.object({
  eventId: z.string().min(1),
  items: z.array(z.object({ ticketTypeId: z.string(), quantity: z.number().int().min(1) })).min(1),
  customer: z.object({
    name: z.string().min(1, "Buyer's name is required."),
    email: z.string().email("A real email, please — the tickets go there."),
    phone: z.string().optional(),
  }),
  method: z.enum(["cash", "transfer", "pos", "complimentary"]),
  note: z.string().optional(),
});

// GET /api/v1/admin/orders?event=&status=&q=&from=&to=&page=&format=csv
export async function GET(req: NextRequest) {
  try {
    await requirePermission("orders");
    const sp = req.nextUrl.searchParams;
    const result = await adminOrderService.list({
      event: sp.get("event") || undefined,
      status: sp.get("status") || undefined,
      q: sp.get("q") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
      ticketType: sp.get("ticketType") || undefined,
      page: Math.max(1, Number(sp.get("page") || 1)),
      limit: Math.min(500, Number(sp.get("limit") || 25)),
    });

    if (sp.get("format") === "csv") {
      const rows = result.items.map((o) => ({
        reference: o.paymentReference,
        event: o.eventName,
        customer: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone ?? "",
        items: o.items.map((i: { quantity: number; name: string }) => `${i.quantity}× ${i.name}`).join("; "),
        checkoutAnswer: o.checkoutAnswer ?? "",
        couponCode: o.couponCode ?? "",
        discount: (o.discountAmount ?? 0) / 100,
        total: o.total / 100,
        method: o.paymentMethod,
        manual: o.manual ? "yes" : "",
        status: o.status,
        createdAt: o.createdAt?.toISOString?.() ?? "",
      }));
      return csvResponse(
        toCsv(rows, [
          { key: "reference", label: "Reference" },
          { key: "event", label: "Event" },
          { key: "customer", label: "Customer" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "items", label: "Items" },
          { key: "checkoutAnswer", label: "Preferred experience" },
          { key: "couponCode", label: "Coupon" },
          { key: "discount", label: "Discount ₦" },
          { key: "total", label: "Total ₦" },
          { key: "method", label: "Payment method" },
          { key: "manual", label: "Manual sale" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" },
        ]),
        "orders.csv",
      );
    }
    return ok(result);
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST /api/v1/admin/orders — manual sale (cash/transfer/POS/comp).
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("orders");
    const input = manualSaleSchema.parse(await req.json());
    const order = await adminOrderService.manualSale(input, user);
    await auditService.record({
      actor: user,
      action: "order.manual-sale",
      entityType: "order",
      entityId: String(order._id),
      entityLabel: `${order.customerName} · ${order.items.map((i: { quantity: number; name: string }) => `${i.quantity}× ${i.name}`).join(", ")}`,
      detail: { method: input.method, total: order.total },
    });
    revalidatePublicSite();
    return ok({ id: String(order._id), reference: order.paymentReference }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
