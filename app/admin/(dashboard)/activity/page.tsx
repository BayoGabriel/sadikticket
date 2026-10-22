import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { auditService } from "@/services/auditService";
import { ActivityClient } from "@/components/admin/settings/ActivityClient";

export const metadata: Metadata = { title: "Activity log" };
export const dynamic = "force-dynamic";

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("audit");
  const sp = await searchParams;
  const result = await auditService.list({ q: sp.q, page: Number(sp.page || 1), limit: 30 });
  return (
    <>
      <PageHeader
        title="Activity log"
        subtitle="Who did what and when — refunds, publishes, edits, invites."
      />
      <ActivityClient
        initial={result.items.map((a) => ({
          id: String(a._id),
          actorName: a.actorName ?? a.actorEmail ?? "System",
          action: a.action,
          entityType: a.entityType ?? "",
          entityLabel: a.entityLabel ?? "",
          detail: (a.detail ?? {}) as Record<string, unknown>,
          createdAt: new Date(a.createdAt).toISOString(),
        }))}
        page={result.page}
        pages={result.pages}
        total={result.total}
      />
    </>
  );
}
