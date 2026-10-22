import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { MediaAssetModel, type MediaAsset } from "@/models/mediaAsset";
import { storage } from "@/services/storage";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { mediaSchema } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    const body = mediaSchema.partial().omit({ kind: true, url: true, publicId: true }).parse(await req.json());
    await connectDb();
    await MediaAssetModel.updateOne({ _id: id }, { $set: body });
    await auditService.record({ actor: user, action: "media.updated", entityType: "media", entityId: id });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    await connectDb();
    const doc = await MediaAssetModel.findByIdAndDelete(id).lean<MediaAsset | null>();
    if (doc?.publicId) {
      try {
        await storage.remove(doc.publicId, doc.kind === "video" ? "video" : "image");
      } catch (e) {
        console.error("media storage delete failed", e);
      }
    }
    await auditService.record({ actor: user, action: "media.deleted", entityType: "media", entityId: id, entityLabel: doc?.alt });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
