import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ProductOrderModel } from "@/models/productOrder";
import { auditService } from "@/services/auditService";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  fulfilled: z.boolean().optional(),
  note: z.string().max(500).optional(),
});

// PATCH — mark fulfilled/unfulfilled or attach a note.
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("orders");
    const { id } = await params;
    const body = patchSchema.parse(await req.json());
    await connectDb();

    const set: Record<string, unknown> = {};
    if (body.fulfilled !== undefined) {
      set.fulfilledAt = body.fulfilled ? new Date() : null;
    }
    const update: Record<string, unknown> = { $set: set };
    if (body.note) {
      update.$push = {
        notes: { text: body.note, author: user.email ?? "admin", createdAt: new Date() },
      };
    }
    await ProductOrderModel.updateOne({ _id: id }, update);
    await auditService.record({
      actor: user,
      action: "shop-order.updated",
      entityType: "productOrder",
      entityId: id,
    });
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
