import { adminFetch } from "@/features/admin/api";
import { ReviewsManager, type ReviewRow } from "./ReviewsManager";

export default async function AdminReviewsPage() {
  let items: ReviewRow[] = [];
  let loadError: string | null = null;
  try {
    const data = await adminFetch<{ items: ReviewRow[] }>(
      "/api/v1/admin/reviews",
    );
    items = data.items;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load reviews";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <p className="text-[#6B6B6B]">
          Only approved reviews show on the site. Never add made-up ones.
        </p>
      </div>
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      <ReviewsManager initial={items} />
    </div>
  );
}
