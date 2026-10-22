import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { UserModel, USER_ROLES } from "@/models/user";
import { auditService } from "@/services/auditService";
import { ApiError } from "@/lib/errors";

const patchSchema = z.object({
  role: z.enum(USER_ROLES as [string, ...string[]]).optional(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const actor = await requirePermission("team");
    const { id } = await params;
    const input = patchSchema.parse(await req.json());
    await connectDb();
    const target = await UserModel.findById(id);
    if (!target) throw new ApiError("NOT_FOUND", "User not found.", 404);
    // An owner can't deactivate or demote themselves.
    if (String(actor.id) === id && (input.active === false || (input.role && input.role !== "OWNER")))
      throw new ApiError("VALIDATION_ERROR", "You can't change your own access — ask another owner.", 400);
    if (input.role) target.role = input.role;
    if (input.name) target.name = input.name;
    if (input.active !== undefined) target.active = input.active;
    await target.save();
    await auditService.record({
      actor,
      action: "team.updated",
      entityType: "user",
      entityId: id,
      entityLabel: `${target.email} → ${target.role}${target.active ? "" : " (deactivated)"}`,
    });
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// DELETE — deactivate (kept for the audit trail; never hard-deleted here).
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const actor = await requirePermission("team");
    const { id } = await params;
    if (String(actor.id) === id)
      throw new ApiError("VALIDATION_ERROR", "You can't remove yourself — ask another owner.", 400);
    await connectDb();
    const target = await UserModel.findByIdAndUpdate(id, { $set: { active: false } });
    if (!target) throw new ApiError("NOT_FOUND", "User not found.", 404);
    await auditService.record({ actor, action: "team.deactivated", entityType: "user", entityId: id, entityLabel: target.email });
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
