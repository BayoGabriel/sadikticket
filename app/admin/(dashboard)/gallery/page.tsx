import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { contentService } from "@/services/contentService";
import { connectDb } from "@/lib/db";
import { MediaAssetModel } from "@/models/mediaAsset";
import { MediaClient } from "@/components/admin/content/MediaClient";

export const metadata: Metadata = { title: "Gallery & media" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requirePermission("content");
  let items: Awaited<ReturnType<typeof contentService.adminMedia>> = [];
  let seeded = false;
  try {
    await connectDb();
    seeded = (await MediaAssetModel.estimatedDocumentCount()) > 0;
  } catch { /* empty */ }
  if (seeded) items = await contentService.adminMedia();
  return (
    <>
      <PageHeader
        title="Gallery & media"
        subtitle="Photos and videos for the public gallery — upload, tag, reorder."
      />
      <MediaClient initial={items} seeded={seeded} />
    </>
  );
}
