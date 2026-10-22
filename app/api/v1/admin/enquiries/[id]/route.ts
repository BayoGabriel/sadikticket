import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { enquiryPipelineService } from "@/services/enquiryPipelineService";
import { auditService } from "@/services/auditService";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/user";

const patchSchema = z.object({
  stage: z.enum(["new", "contacted", "quote_sent", "confirmed", "done", "lost", "spam"]).optional(),
  ownerId: z.string().nullable().optional(),
  followUpAt: z.string().nullable().optional(),
  quoteNaira: z.number().nullable().optional(),
  booking: z.object({ date: z.string().optional(), venue: z.string().optional(), priceNaira: z.number().nullable().optional() }).optional(),
  read: z.boolean().optional(),
  note: z.string().min(1).optional(),
});

// PATCH /api/v1/admin/enquiries/:id — stage moves, assignment, follow-ups,
// quotes, booking details, read state, and quick notes.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requirePermission("enquiries");
    const { id } = await ctx.params;
    const input = patchSchema.parse(await req.json());

    // Resolve owner name from the user record.
    let ownerName: string | null = null;
    if (input.ownerId) {
      await connectDb();
      const u = await UserModel.findById(input.ownerId).lean<{ name: string } | null>();
      ownerName = u?.name ?? null;
    }

    const hasUpdate =
      input.stage !== undefined || input.ownerId !== undefined || input.read !== undefined ||
      input.followUpAt !== undefined || input.quoteNaira !== undefined || input.booking !== undefined;

    if (hasUpdate) {
      await enquiryPipelineService.update(
        id,
        {
          stage: input.stage,
          ownerId: input.ownerId ?? undefined,
          ownerName,
          followUpAt: input.followUpAt === undefined ? undefined : input.followUpAt ? new Date(input.followUpAt) : null,
          quoteNaira: input.quoteNaira,
          booking: input.booking,
          read: input.read,
        },
        user,
      );
    }
    if (input.note) await enquiryPipelineService.addNote(id, input.note, user);

    if (input.stage) {
      await auditService.record({
        actor: user,
        action: `enquiry.${input.stage}`,
        entityType: "enquiry",
        entityId: id,
      });
    }
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
