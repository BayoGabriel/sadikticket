import { connectDb } from "@/lib/db";
import { ReviewModel, type Review } from "@/models/review";

export type PublicReview = {
  id: string;
  name: string;
  context?: string;
  kind: "guest" | "client";
  text: string;
};

export const reviewService = {
  // Approved reviews only; returns [] when DB is unavailable or none exist,
  // so callers can hide the section entirely (never invent reviews).
  async listApproved(limit = 3): Promise<PublicReview[]> {
    try {
      await connectDb();
      // Only reviews with confirmed permission may be published anywhere.
      const rows = await ReviewModel.find({ approved: true, permissionConfirmed: true })
        .sort({ featured: -1, order: 1, createdAt: -1 })
        .limit(limit)
        .lean<Review[]>();
      return rows.map((r) => ({
        id: r._id.toString(),
        name: r.name,
        context: r.context ?? undefined,
        kind: r.kind,
        text: r.shortText || r.text,
      }));
    } catch {
      return [];
    }
  },
};
