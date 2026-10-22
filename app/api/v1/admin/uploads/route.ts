import { NextRequest } from "next/server";
import { requirePermission, can } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { storage, validateUploadSize } from "@/services/storage";
import { ApiError } from "@/lib/errors";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// POST /api/v1/admin/uploads  (multipart: file, folder?, kind?)
// Returns { url, publicId, width, height } — used by every image field in admin.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("events").catch(() =>
      requirePermission("content"),
    );
    void user;

    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "serenart/admin");
    if (!(file instanceof File)) throw new ApiError("VALIDATION_ERROR", "No file attached.", 400);

    const kind = VIDEO_TYPES.includes(file.type) ? "video" : IMAGE_TYPES.includes(file.type) ? "image" : null;
    if (!kind)
      throw new ApiError(
        "VALIDATION_ERROR",
        "That file type isn't supported — use a JPG, PNG, WebP image or MP4/WebM video.",
        400,
      );
    validateUploadSize(kind, file.size);

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await storage.upload({
      buffer,
      filename: file.name,
      folder,
      resourceType: kind,
    });

    return ok({
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      bytes: uploaded.bytes,
      duration: uploaded.duration,
      kind: uploaded.resourceType,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
