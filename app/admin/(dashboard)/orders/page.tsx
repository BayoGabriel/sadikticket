import { Suspense } from "react";
import { adminOrderService } from "@/services/adminOrderService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OrdersClient } from "@/components/admin/orders/OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const status = sp.status || "";
  const data = await adminOrderService.list({
    event: sp.event || undefined,
    status: status || undefined,
    q: sp.q || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    ticketType: sp.ticketType || undefined,
    page: Math.max(1, Number(sp.page || 1)),
    limit: 25,
  });

  await connectDb();
  const events = await EventModel.find({ status: { $ne: "ARCHIVED" } })
    .sort({ startsAt: -1 })
    .select("name slug")
    .lean();

  return (
    <div>
      <PageHeader title="Orders & tickets" subtitle="Every sale, every ticket, every refund — in one place." />
      <Suspense>
        <OrdersClient
          initial={JSON.parse(JSON.stringify(data))}
          events={events.map((e) => ({ id: String(e._id), name: e.name }))}
          query={{
            event: sp.event || "",
            status,
            q: sp.q || "",
            from: sp.from || "",
            to: sp.to || "",
            page: Number(sp.page || 1),
            newManual: sp.new === "manual",
          }}
        />
      </Suspense>
    </div>
  );
}
