import { Suspense } from "react";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { waitlistService } from "@/services/waitlistService";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { WaitlistClient } from "@/components/admin/waitlist/WaitlistClient";

export const dynamic = "force-dynamic";

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const sp = await searchParams;
  await connectDb();
  const events = await EventModel.find({ status: { $ne: "ARCHIVED" } })
    .sort({ startsAt: -1 })
    .select("name startsAt")
    .lean();
  const counts = await waitlistService.countsByEvent();
  const items = await waitlistService.list(sp.event || undefined);
  const freed = sp.event ? await waitlistService.freedInfo(sp.event) : null;

  return (
    <div>
      <PageHeader title="Waitlist" subtitle="People who want in when a sold-out event frees up." />
      <Suspense>
        <WaitlistClient
          freed={freed}
          events={events.map((e) => ({ id: String(e._id), name: e.name, startsAt: String(e.startsAt), waiting: counts.get(String(e._id)) ?? 0 }))}
          items={JSON.parse(JSON.stringify(items.map((w) => ({ id: String(w._id), name: w.name, email: w.email, phone: w.phone, eventId: String(w.eventId), eventName: w.eventName, status: w.status, createdAt: w.createdAt, notifiedAt: w.notifiedAt }))))}
          selectedEvent={sp.event || ""}
        />
      </Suspense>
    </div>
  );
}
