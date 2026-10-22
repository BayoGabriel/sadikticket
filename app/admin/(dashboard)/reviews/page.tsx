import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { connectDb } from "@/lib/db";
import { ReviewModel, type Review } from "@/models/review";
import { ReviewsClient } from "@/components/admin/content/ReviewsClient";

export const metadata: Metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requirePermission("reviews");
  await connectDb();
  const items = await ReviewModel.find().sort({ order: 1, createdAt: -1 }).lean<Review[]>();
  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Real words from real guests — they only appear on the site once approved and permission-confirmed."
      />
      <ReviewsClient
        initial={items.map((r) => ({
          id: String(r._id),
          name: r.name,
          context: r.context ?? "",
          kind: r.kind,
          text: r.text,
          shortText: r.shortText ?? "",
          photo: r.photo ?? "",
          source: r.source ?? "written",
          permissionConfirmed: Boolean(r.permissionConfirmed),
          featured: Boolean(r.featured),
          approved: Boolean(r.approved),
          company: r.company ?? "",
          role: r.role ?? "",
        }))}
      />
    </>
  );
}
