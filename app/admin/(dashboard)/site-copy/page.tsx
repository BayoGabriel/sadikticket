import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { contentService } from "@/services/contentService";
import { SiteCopyClient } from "@/components/admin/content/SiteCopyClient";

export const metadata: Metadata = { title: "Site content" };
export const dynamic = "force-dynamic";

export default async function AdminSiteCopyPage() {
  await requirePermission("content");
  const fields = await contentService.adminSiteContent();
  return (
    <>
      <PageHeader
        title="Site content"
        subtitle="Edit any text or photo on the public site. Blank = the built-in default."
      />
      <SiteCopyClient initial={fields} />
    </>
  );
}
