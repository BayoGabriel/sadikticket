import { Suspense } from "react";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { subscriberService } from "@/services/subscriberService";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SubscribersClient } from "@/components/admin/subscribers/SubscribersClient";

export const dynamic = "force-dynamic";

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [data, cityCounts] = await Promise.all([
    subscriberService.list({
      q: sp.q || undefined,
      city: sp.city || undefined,
      source: sp.source || undefined,
      status: sp.status || undefined,
      page: Math.max(1, Number(sp.page || 1)),
      limit: 25,
    }),
    subscriberService.cityCounts(),
  ]);

  await connectDb();
  const events = await EventModel.find({ status: "PUBLISHED" }).sort({ startsAt: -1 }).select("name city").lean();

  return (
    <div>
      <PageHeader title="Subscribers" subtitle={`${data.total} people hearing from you.`} />
      <Suspense>
        <SubscribersClient
          initial={JSON.parse(JSON.stringify({ ...data, items: data.items.map((s) => ({ id: String(s._id), email: s.email, city: s.city ?? "", source: s.source, status: s.status, createdAt: s.createdAt })) }))}
          cities={cityCounts.map((c) => ({ city: c._id || "—", count: c.n }))}
          events={events.map((e) => ({ id: String(e._id), name: e.name, city: e.city }))}
          query={{ q: sp.q || "", city: sp.city || "", source: sp.source || "", status: sp.status || "", page: Number(sp.page || 1) }}
        />
      </Suspense>
    </div>
  );
}
