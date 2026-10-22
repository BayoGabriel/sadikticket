import { NextRequest } from "next/server";
import { connectDb } from "@/lib/db";
import { requireAuth, can } from "@/lib/auth";
import { EventModel, type Event } from "@/models/event";
import { OrderModel, type Order } from "@/models/order";
import { EnquiryModel, type Enquiry } from "@/models/enquiry";
import { SubscriberModel } from "@/models/subscriber";
import { TicketModel } from "@/models/ticket";
import { formatNaira } from "@/lib/format";

type Hit = { type: string; id: string; title: string; subtitle?: string; href: string };

// GET /api/v1/admin/search?q=… — global search for the command palette.
export async function GET(req: NextRequest) {
  const user = await requireAuth();
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return Response.json({ results: [] });

  await connectDb();
  const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const results: Hit[] = [];

  const jobs: Promise<void>[] = [];

  if (can(user.role, "events")) {
    jobs.push(
      EventModel.find({ $or: [{ name: rx }, { venueName: rx }, { slug: rx }] })
        .sort({ startsAt: -1 })
        .limit(5)
        .lean<Event[]>()
        .then((rows) => {
          for (const e of rows)
            results.push({
              type: "event",
              id: String(e._id),
              title: e.name,
              subtitle: `${e.city ?? ""} · ${e.status.toLowerCase()}`,
              href: `/admin/events/${e._id}`,
            });
        }),
    );
  }

  if (can(user.role, "orders")) {
    jobs.push(
      OrderModel.find({
        $or: [
          { customerName: rx },
          { customerEmail: rx },
          { customerPhone: rx },
          { paymentReference: rx },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<Order[]>()
        .then((rows) => {
          for (const o of rows)
            results.push({
              type: "order",
              id: String(o._id),
              title: `${o.customerName} · ${formatNaira(o.total)}`,
              subtitle: o.paymentReference,
              href: `/admin/orders/${o._id}`,
            });
        }),
    );
    // Ticket codes resolve to their order
    jobs.push(
      TicketModel.find({ $or: [{ ticketCode: rx }, { qrToken: rx }] })
        .limit(3)
        .lean<{ _id: unknown; orderId: unknown; holderName: string; ticketCode: string }[]>()
        .then((rows) => {
          for (const t of rows)
            results.push({
              type: "order",
              id: String(t._id),
              title: `Ticket ${t.ticketCode} · ${t.holderName}`,
              subtitle: "Open the order",
              href: `/admin/orders/${t.orderId}`,
            });
        }),
    );
  }

  if (can(user.role, "enquiries")) {
    jobs.push(
      EnquiryModel.find({
        kind: { $in: ["private-booking", "business", "general"] },
        $or: [{ name: rx }, { email: rx }, { phone: rx }, { company: rx }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<Enquiry[]>()
        .then((rows) => {
          for (const e of rows)
            results.push({
              type: "enquiry",
              id: String(e._id),
              title: e.name || e.email,
              subtitle: e.kind === "business" ? `Business · ${e.company ?? ""}` : e.kind,
              href: `/admin/enquiries?id=${e._id}`,
            });
        }),
    );
  }

  if (can(user.role, "subscribers")) {
    jobs.push(
      SubscriberModel.find({ email: rx })
        .limit(3)
        .lean<{ _id: unknown; email: string }[]>()
        .then((rows) => {
          for (const s of rows)
            results.push({
              type: "subscriber",
              id: String(s._id),
              title: s.email,
              subtitle: "Subscriber",
              href: "/admin/subscribers",
            });
        }),
    );
  }

  await Promise.all(jobs.map((j) => j.catch(() => {})));
  return Response.json({ results: results.slice(0, 12) });
}
