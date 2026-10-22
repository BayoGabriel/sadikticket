import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { MediaAssetModel, MEDIA_TAGS } from "@/models/mediaAsset";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const mediaSchema = z.object({
  kind: z.enum(["photo", "video"]),
  url: z.string().min(1).max(600),
  poster: z.string().max(600).default(""),
  publicId: z.string().max(300).default(""),
  alt: z.string().max(300).default(""),
  tags: z.array(z.string().max(60)).max(10).default([]),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number().optional(),
  duration: z.number().optional(),
  order: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requirePermission("content");
    const items = await contentService.adminMedia();
    return ok({ items, tags: MEDIA_TAGS });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST — register a file that was uploaded via /api/v1/admin/uploads.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = mediaSchema.parse(await req.json());
    await connectDb();
    const doc = await MediaAssetModel.create(body);
    await auditService.record({ actor: user, action: "media.added", entityType: "media", entityId: String(doc._id), entityLabel: body.alt || body.url.split("/").pop() });
    revalidatePublicSite();
    return ok({ id: String(doc._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
    await connectDb();
    await Promise.all(ids.map((id, i) => MediaAssetModel.updateOne({ _id: id }, { $set: { order: i } })));
    await auditService.record({ actor: user, action: "media.reordered", entityType: "media" });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
