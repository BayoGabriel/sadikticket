import { Suspense } from "react";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/user";
import { enquiryPipelineService } from "@/services/enquiryPipelineService";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EnquiriesClient } from "@/components/admin/enquiries/EnquiriesClient";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [items, counts] = await Promise.all([
    enquiryPipelineService.list({
      tab: sp.tab || undefined,
      stage: sp.stage || undefined,
      city: sp.city || undefined,
      owner: sp.owner || undefined,
      q: sp.q || undefined,
      from: sp.from || undefined,
      to: sp.to || undefined,
    }),
    enquiryPipelineService.counts(),
  ]);

  await connectDb();
  const team = await UserModel.find({ active: { $ne: false } }).select("name role").lean();

  return (
    <div>
      <PageHeader title="Enquiries" subtitle="Private bookings and SerenArt Business leads — one inbox." />
      <Suspense>
        <EnquiriesClient
          items={JSON.parse(JSON.stringify(items.map((e) => ({
            id: String(e._id),
            kind: e.kind,
            name: e.name ?? "",
            email: e.email,
            phone: e.phone ?? "",
            company: e.company ?? "",
            occasion: e.occasion ?? "",
            experience: e.experience ?? "",
            service: e.service ?? "",
            date: e.date ?? "",
            guests: e.guests ?? e.size ?? "",
            location: e.location ?? e.city ?? "",
            frequency: e.frequency ?? "",
            message: e.message ?? e.extra ?? e.goals ?? "",
            stage: e.stage,
            read: e.read,
            ownerId: e.ownerId ? String(e.ownerId) : "",
            ownerName: e.ownerName ?? "",
            followUpAt: e.followUpAt ?? null,
            quoteAmount: e.quoteAmount ?? null,
            booking: e.booking ?? null,
            notes: e.notes ?? [],
            createdAt: e.createdAt,
            ageHours: e.ageHours,
          }))))}
          counts={counts}
          team={team.map((u) => ({ id: String(u._id), name: u.name }))}
          query={{ tab: sp.tab || "all", stage: sp.stage || "", q: sp.q || "", owner: sp.owner || "" }}
        />
      </Suspense>
    </div>
  );
}
