import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { connectDb } from "@/lib/db";
import { OrderModel, type Order } from "@/models/order";
import { TicketModel, type Ticket } from "@/models/ticket";
import { EventModel, type Event } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { TicketQRCode } from "@/features/tickets/components/TicketQRCode";

async function getTickets(orderId: string) {
  await connectDb();
  const order = await OrderModel.findById(orderId).lean<Order | null>();
  if (!order) return null;
  const [event, tickets] = await Promise.all([
    EventModel.findById(order.eventId).lean<Event | null>(),
    TicketModel.find({ orderId: order._id }).lean<Ticket[]>(),
  ]);
  // Fetch ticket type names for display
  const typeIds = Array.from(
    new Set(
      tickets.map((t: any) => t.ticketTypeId?.toString()).filter(Boolean),
    ),
  );
  let typeNameById: Record<string, string> = {};
  if (typeIds.length) {
    const types = await TicketTypeModel.find({ _id: { $in: typeIds } })
      .select("name")
      .lean();
    typeNameById = Object.fromEntries(
      types.map((tt: any) => [tt._id.toString(), tt.name]),
    );
  }
  return { order, event, tickets, typeNameById } as const;
}

export default async function TicketsPage({
  params,
}: {
  params: { orderId: string };
}) {
  const data = await getTickets(params.orderId);
  if (!data) return notFound();
  const { order, event, tickets, typeNameById } = data;

  return (
    <main className="min-h-screen bg-(--surface-muted)">
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-semibold">Your tickets</h1>
        {event && (
          <div className="mt-2 text-(--text-muted)">
            {event.name} · {event.city ? `${event.city}, ` : ""}
            {event.country || ""}
          </div>
        )}
        {order.status !== "PAID" && (
          <div className="mt-4 rounded-2xl bg-white border border-(--border) p-6 text-(--text-muted)">
            Payment not confirmed yet. Please check back shortly.
          </div>
        )}
        <div className="mt-6 space-y-4">
          {tickets.map((t: any) => (
            <div
              key={t._id.toString()}
              className="rounded-2xl bg-white border border-(--border) p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm text-(--text-muted)">
                    {typeNameById[t.ticketTypeId?.toString() || ""] || "Ticket"}
                  </div>
                  <div className="text-lg font-semibold wrap-break-word">
                    {t.ticketCode}
                  </div>
                  <div className="mt-1 text-sm text-(--text-muted)">
                    {t.holderName}
                  </div>
                  <div className="mt-1 text-sm">Status: {t.status}</div>
                </div>
                <div className="shrink-0 rounded-lg">
                  {t.qrToken ? (
                    <TicketQRCode value={t.qrToken} size={192} />
                  ) : (
                    <div className="w-48 h-48 bg-(--surface-muted) grid place-items-center rounded-lg text-(--text-muted) text-xs">
                      QR unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="rounded-2xl bg-white border border-(--border) p-6">
              No tickets found for this order.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
