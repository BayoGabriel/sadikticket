import { couponService } from "@/services/couponService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { TicketTypeModel } from "@/models/ticketType";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CouponsClient } from "@/components/admin/coupons/CouponsClient";

export const dynamic = "force-dynamic";

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const sp = await searchParams;
  const [items, events, types] = await Promise.all([
    couponService.list(),
    connectDb().then(() =>
      EventModel.find({ status: { $ne: "ARCHIVED" } }).sort({ startsAt: -1 }).select("name").lean(),
    ),
    TicketTypeModel.find().select("eventId name").lean(),
  ]);
  const eventName = new Map(events.map((e) => [String(e._id), e.name]));

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Discount codes guests type in at checkout." />
      <CouponsClient
        openNew={sp.new === "1"}
        items={items.map((c) => ({
          id: String(c._id),
          code: c.code,
          kind: c.kind,
          value: c.value,
          startsAt: c.startsAt ? String(c.startsAt) : null,
          expiresAt: c.expiresAt ? String(c.expiresAt) : null,
          usageCount: c.usageCount,
          usageLimit: c.usageLimit ?? null,
          perCustomerLimit: c.perCustomerLimit ?? null,
          minOrderAmount: c.minOrderAmount ?? null,
          eventIds: [...(c.eventId ? [String(c.eventId)] : []), ...(c.eventIds ?? []).map(String)],
          ticketTypeIds: (c.ticketTypeIds ?? []).map(String),
          discountedTotal: c.discountedTotal ?? 0,
          active: c.active,
        }))}
        events={events.map((e) => ({ id: String(e._id), name: e.name }))}
        ticketTypes={types.map((t) => ({ id: String(t._id), eventId: String(t.eventId), name: `${eventName.get(String(t.eventId)) ?? "?"} — ${t.name}` }))}
        eventName={Object.fromEntries(eventName)}
      />
    </div>
  );
}
