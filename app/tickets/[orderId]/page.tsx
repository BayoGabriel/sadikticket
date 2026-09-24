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
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const data = await getTickets(orderId);
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
              className="rounded-3xl bg-white border border-(--border) p-0 overflow-hidden shadow-sm"
            >
              <div className="flex items-stretch flex-col sm:flex-row">
                <div className="flex-1 p-6">
                  <div className="text-xs font-medium tracking-wide text-(--brand-primary)">
                    SERENART
                  </div>
                  <div className="mt-1 text-lg font-semibold wrap-break-word">
                    {t.ticketCode}
                  </div>
                  <div className="mt-1 text-sm text-(--text-muted)">
                    {typeNameById[t.ticketTypeId?.toString() || ""] || "Ticket"}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    {event && (
                      <div>
                        <div className="text-(--text-muted)">Event</div>
                        <div className="font-medium">{event.name}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-(--text-muted)">Holder</div>
                      <div className="font-medium">{t.holderName}</div>
                    </div>
                    <div>
                      <div className="text-(--text-muted)">Status</div>
                      <div className="font-medium">{t.status}</div>
                    </div>
                  </div>
                </div>
                <div className="sm:border-l sm:border-(--border) bg-white p-6 grid place-items-center">
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
