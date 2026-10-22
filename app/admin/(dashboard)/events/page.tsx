import Link from "next/link";
import { Suspense } from "react";
import { adminEventService } from "@/services/adminEventService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { settingsService } from "@/services/settingsService";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EventsClient } from "@/components/admin/events/EventsClient";
import { Icon } from "@/components/admin/ui/icons";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const data = await adminEventService.list({
    tab: (sp.tab as "upcoming" | "past" | "drafts" | "all") || "upcoming",
    city: sp.city,
    eventType: sp.type,
    tag: sp.tag,
    month: sp.month,
    status: sp.status,
    search: sp.search,
    sort: sp.sort,
    order: sp.order as "asc" | "desc" | undefined,
    page: Math.max(1, Number(sp.page || 1)),
    limit: 20,
  });

  // Filter option sources — distinct values + configured cities
  await connectDb();
  const [citiesSet, typesSet, settings] = await Promise.all([
    EventModel.distinct("city", { status: { $ne: "ARCHIVED" } }),
    EventModel.distinct("eventType", { status: { $ne: "ARCHIVED" } }),
    settingsService.getPublic(),
  ]);
  const cities = [...new Set([...(settings.cities ?? []), ...citiesSet.filter(Boolean)])];
  const types = typesSet.filter(Boolean).sort() as string[];

  return (
    <div>
      <PageHeader title="Events" subtitle="Create, publish and keep an eye on every night.">
        <Link href="/admin/events/new" className="a-btn a-btn-orange">
          <Icon name="plus" size={15} /> New event
        </Link>
      </PageHeader>
      <Suspense>
        <EventsClient
          initial={data}
          cities={cities}
          types={types}
          query={{
            tab: sp.tab || "upcoming",
            city: sp.city || "",
            type: sp.type || "",
            tag: sp.tag || "",
            month: sp.month || "",
            status: sp.status || "",
            search: sp.search || "",
            sort: sp.sort || "",
            order: sp.order || "",
            page: Number(sp.page || 1),
          }}
        />
      </Suspense>
    </div>
  );
}
