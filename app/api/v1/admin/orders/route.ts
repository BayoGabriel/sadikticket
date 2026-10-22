import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { toCsv, csvResponse } from "@/lib/csv";
import { connectDb } from "@/lib/db";
import { OrderModel, type Order } from "@/models/order";
import { EventModel, type Event } from "@/models/event";
import { Types } from "mongoose";

// GET /api/v1/admin/orders?eventId=&status=&format=csv
export async function GET(req: NextRequest) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    await connectDb();
    const sp = new URL(req.url).searchParams;

    const query: Record<string, unknown> = {};
    if (sp.get("eventId")) query.eventId = new Types.ObjectId(sp.get("eventId")!);
    if (sp.get("status")) query.status = sp.get("status");

    const orders = await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .lean<Order[]>();

    const events = await EventModel.find({
      _id: { $in: [...new Set(orders.map((o) => o.eventId))] },
    })
      .select("name")
      .lean<Event[]>();
    const eventName = new Map(events.map((e) => [String(e._id), e.name]));

    const rows = orders.map((o) => ({
      id: String(o._id),
      reference: o.paymentReference,
      event: eventName.get(String(o.eventId)) ?? "",
      customer: o.customerName,
      email: o.customerEmail,
      phone: o.customerPhone ?? "",
      items: o.items.map((i) => `${i.quantity}× ${i.name}`).join("; "),
      checkoutAnswer: o.checkoutAnswer ?? "",
      couponCode: o.couponCode ?? "",
      discount: (o.discountAmount ?? 0) / 100,
      total: o.total / 100,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt?.toISOString?.() ?? "",
    }));

    if (sp.get("format") === "csv") {
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
          { key: "discount", label: "Discount" },
          { key: "total", label: "Total" },
          { key: "currency", label: "Currency" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" },
        ]),
        "orders.csv",
      );
    }

    return ok({ items: rows });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
