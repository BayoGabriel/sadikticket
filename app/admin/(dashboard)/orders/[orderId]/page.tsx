import { notFound } from "next/navigation";
import { adminOrderService } from "@/services/adminOrderService";
import { qrCodeService } from "@/services/qrCodeService";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OrderDetailClient } from "@/components/admin/orders/OrderDetailClient";
import { ApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  let d;
  try {
    d = await adminOrderService.detail(orderId);
  } catch (e) {
    if (e instanceof ApiError) notFound();
    throw e;
  }

  await connectDb();
  const [events, targetTypes] = await Promise.all([
    EventModel.find({ status: { $ne: "ARCHIVED" }, _id: { $ne: d.order.eventId } }).select("name").lean(),
    TicketTypeModel.find({ eventId: { $ne: d.order.eventId } }).select("eventId name quantity quantitySold").lean(),
  ]);

  // QR codes for each ticket (data URLs for instant render).
  const qrs: Record<string, string> = {};
  for (const t of d.tickets) {
    try {
      qrs[String(t._id)] = await qrCodeService.toDataUrl(`${env.APP_URL}/ticket/verify/${t.qrToken}`);
    } catch {
      /* QR generation is cosmetic — never fail the page */
    }
  }

  return (
    <div>
      <PageHeader
        title={`Order ${d.order.paymentReference}`}
        subtitle={d.event?.name ?? "Unknown event"}
      >
        {d.event && (
          <a href={`/events/${d.event.slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost a-btn-sm">
            View event
          </a>
        )}
      </PageHeader>
      <OrderDetailClient
        order={JSON.parse(JSON.stringify(d.order))}
        tickets={d.tickets.map((t) => ({
          id: String(t._id),
          code: t.ticketCode,
          holderName: t.holderName,
          holderEmail: t.holderEmail,
          status: t.status,
          checkedInAt: t.checkedInAt ? String(t.checkedInAt) : null,
          emailStatus: t.emailStatus,
          qr: qrs[String(t._id)],
          typeName: d.typeNames[String(t.ticketTypeId)] ?? "Ticket",
        }))}
        event={d.event ? { id: String(d.event._id), name: d.event.name, slug: d.event.slug, startsAt: String(d.event.startsAt), venueName: d.event.venueName ?? "", city: d.event.city ?? "" } : null}
        transferTargets={events.map((e) => ({
          id: String(e._id),
          name: e.name,
          types: targetTypes
            .filter((t) => String(t.eventId) === String(e._id))
            .map((t) => ({ id: String(t._id), name: t.name, remaining: t.quantity - t.quantitySold })),
        }))}
      />
    </div>
  );
}
