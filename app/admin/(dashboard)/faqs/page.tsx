import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { contentService } from "@/services/contentService";
import { FaqsClient } from "@/components/admin/content/FaqsClient";

export const metadata: Metadata = { title: "FAQs" };
export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  await requirePermission("content");
  const items = await contentService.adminFaqs();
  return (
    <>
      <PageHeader
        title="FAQs"
        subtitle="The questions on the FAQs page — the ones marked “show on event pages” also appear under each event."
      />
      <FaqsClient initial={items} />
    </>
  );
}
