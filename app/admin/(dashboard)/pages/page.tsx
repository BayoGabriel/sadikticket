import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { contentService } from "@/services/contentService";
import { PagesClient } from "@/components/admin/content/PagesClient";

export const metadata: Metadata = { title: "Policies & pages" };
export const dynamic = "force-dynamic";

const PAGES = [
  { key: "refunds", title: "Refunds and Cancellations", path: "/refunds" },
  { key: "terms", title: "Terms", path: "/terms" },
  { key: "privacy", title: "Privacy", path: "/privacy" },
];

export default async function AdminPagesPage() {
  await requirePermission("content");
  const items = await Promise.all(
    PAGES.map(async (p) => {
      const current = await contentService.page(p.key);
      const versions = await contentService.pageVersions(p.key);
      return {
        ...p,
        content: current?.content ?? "",
        lastUpdatedAt: current?.lastUpdatedAt ? new Date(current.lastUpdatedAt).toISOString() : null,
        versions: versions.map((v) => ({
          content: v.content,
          savedBy: v.savedBy ?? "",
          savedAt: new Date(v.savedAt).toISOString(),
        })),
      };
    }),
  );
  return (
    <>
      <PageHeader
        title="Policies & pages"
        subtitle="The small print — Refunds, Terms and Privacy. Saved changes are live immediately."
      />
      <PagesClient initial={items} />
    </>
  );
}
