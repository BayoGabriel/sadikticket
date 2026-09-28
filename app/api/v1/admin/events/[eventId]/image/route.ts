import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { requireRole } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { ticketTypeAdminService } from "@/services/ticketTypeAdminService";
import { uploadEventImage } from "@/lib/cloudinary";

// POST /api/v1/admin/events/:eventId/image
// Accepts multipart/form-data with field "image"; uploads to Cloudinary and sets event.coverImage
export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);

    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof Blob)) throw new Error("image file required");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadEventImage(buffer, (file as any).name || undefined);

    await connectDb();
    await EventModel.updateOne({ _id: eventId }, { $set: { coverImage: uploaded.url } });

    return ok({ url: uploaded.url });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// DELETE /api/v1/admin/events/:eventId/image
// Unsets event.coverImage (does not delete the cloud asset)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "EVENT_ADMIN"]);
    const { eventId } = await ctx.params;
    await ticketTypeAdminService.assertEventAccess(eventId, user);
    await connectDb();
    await EventModel.updateOne({ _id: eventId }, { $unset: { coverImage: 1 } });
    return ok({});
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
