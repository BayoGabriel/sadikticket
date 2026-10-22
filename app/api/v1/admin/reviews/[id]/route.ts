import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ReviewModel } from "@/models/review";

const patchSchema = z.object({
  approved: z.boolean().optional(),
  text: z.string().min(1).max(2000).optional(),
  name: z.string().min(1).max(120).optional(),
  context: z.string().max(160).optional(),
});

// PATCH /api/v1/admin/reviews/[id] — approve/hide/edit
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { id } = await ctx.params;
    const input = patchSchema.parse(await req.json());
    await connectDb();
    const doc = await ReviewModel.findByIdAndUpdate(id, input, { new: true });
    if (!doc) throw new Error("Review not found");
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
    await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { id } = await ctx.params;
    await connectDb();
    await ReviewModel.findByIdAndDelete(id);
    return ok({ deleted: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
