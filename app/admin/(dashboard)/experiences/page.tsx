import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { contentService } from "@/services/contentService";
import { ExperiencesClient } from "@/components/admin/content/ExperiencesClient";

export const metadata: Metadata = { title: "Experiences" };
export const dynamic = "force-dynamic";

export default async function AdminExperiencesPage() {
  await requirePermission("content");
  const items = await contentService.adminExperiences();
  return (
    <>
      <PageHeader
        title="Experiences"
        subtitle="The cards and detail pages under “Everything we do” on the site."
      />
      <ExperiencesClient initial={items} />
    </>
  );
}
