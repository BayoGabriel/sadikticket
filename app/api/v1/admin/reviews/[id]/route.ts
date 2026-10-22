import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ReviewModel } from "@/models/review";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { reviewSchema } from "../route";

// PATCH /api/v1/admin/reviews/[id] — approve/hide/edit/reorder fields
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("reviews");
    const { id } = await ctx.params;
    const input = reviewSchema.partial().parse(await req.json());
    await connectDb();
    const doc = await ReviewModel.findByIdAndUpdate(id, { $set: input }, { new: true });
    if (!doc) throw new Error("Review not found");
    if (input.approved !== undefined) {
      await auditService.record({
        actor: user,
        action: input.approved ? "review.approved" : "review.hidden",
        entityType: "review",
        entityId: id,
        entityLabel: doc.name,
      });
    }
    revalidatePublicSite();
    return ok({ id: String(doc._id), approved: doc.approved });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// DELETE /api/v1/admin/reviews/[id]
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("reviews");
    const { id } = await ctx.params;
    await connectDb();
    await ReviewModel.findByIdAndDelete(id);
    await auditService.record({ actor: user, action: "review.deleted", entityType: "review", entityId: id });
    revalidatePublicSite();
    return ok({ deleted: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
