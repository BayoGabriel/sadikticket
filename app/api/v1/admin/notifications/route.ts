import { connectDb } from "@/lib/db";
import { requireAuth, can } from "@/lib/auth";
import { EnquiryModel } from "@/models/enquiry";
import { OrderModel } from "@/models/order";
import { EventModel } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { WaitlistEntryModel } from "@/models/waitlistEntry";
import { settingsService } from "@/services/settingsService";

// GET /api/v1/admin/notifications — derived live, never stored:
// new enquiries, failed payments, sold-out events with waiters, low stock.
export async function GET() {
  const user = await requireAuth();
  const notifications: { id: string; text: string; href: string; level: "info" | "warn" }[] = [];

  try {
    await connectDb();
    const jobs: Promise<void>[] = [];

    if (can(user.role, "enquiries")) {
      jobs.push(
        EnquiryModel.countDocuments({
          kind: { $in: ["private-booking", "business", "general"] },
          read: false,
          stage: { $ne: "spam" },
        }).then((n) => {
          if (n > 0)
            notifications.push({
              id: "enquiries",
              text: `${n} new ${n === 1 ? "enquiry" : "enquiries"} waiting for a reply`,
              href: "/admin/enquiries",
              level: "warn",
            });
        }),
      );
    }

    if (can(user.role, "orders")) {
      jobs.push(
        OrderModel.countDocuments({ status: "FAILED" }).then((n) => {
          if (n > 0)
            notifications.push({
              id: "failed-payments",
              text: `${n} failed ${n === 1 ? "payment" : "payments"} to look at`,
              href: "/admin/orders?status=FAILED",
              level: "warn",
            });
        }),
      );
    }

    if (can(user.role, "events")) {
      jobs.push(
        (async () => {
          const settings = await settingsService.getPublic();
          const threshold = settings.fewLeftThreshold;
          const events = await EventModel.find({
            status: "PUBLISHED",
            startsAt: { $gt: new Date() },
          })
            .lean<{ _id: unknown; name: string }[]>();
          const soldOut: string[] = [];
          for (const e of events) {
            const types = await TicketTypeModel.find({ eventId: e._id, status: "ACTIVE" })
              .lean<{ quantity: number; quantitySold: number }[]>();
            const remaining = types.reduce((a, t) => a + Math.max(0, t.quantity - t.quantitySold), 0);
            if (types.length && remaining === 0) soldOut.push(String(e._id));
            else if (types.length && remaining <= (threshold ?? 10))
              notifications.push({
                id: `low-${e._id}`,
                text: `“${e.name}” is nearly sold out — ${remaining} left`,
                href: `/admin/events/${e._id}`,
                level: "warn",
              });
          }
          if (soldOut.length) {
            const waiters = await WaitlistEntryModel.countDocuments({
              eventId: { $in: soldOut },
              status: "waiting",
            });
            if (waiters > 0)
              notifications.push({
                id: "waiters",
                text: `${waiters} ${waiters === 1 ? "person is" : "people are"} on the waitlist for sold-out events`,
                href: "/admin/waitlist",
                level: "info",
              });
          }
        })(),
      );
    }

    await Promise.all(jobs.map((j) => j.catch(() => {})));
  } catch {
    // DB down → empty notifications, shell still works
  }

  return Response.json({ notifications: notifications.slice(0, 8) });
}
