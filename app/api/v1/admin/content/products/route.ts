import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ProductModel, type Product } from "@/models/product";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const productSchema = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(1000).default(""),
  price: z.number().int().min(0), // kobo
  currency: z.string().max(8).default("NGN"),
  images: z.array(z.string().max(500)).max(8).default([]),
  inStock: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requirePermission("content");
    await connectDb();
    const items = await ProductModel.find()
      .sort({ order: 1, createdAt: 1 })
      .lean<Product[]>();
    return ok({ items: items.map((p) => ({ ...p, id: String(p._id) })) });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = productSchema.parse(await req.json());
    await connectDb();
    const doc = await ProductModel.create(body);
    await auditService.record({ actor: user, action: "product.created", entityType: "product", entityId: String(doc._id), entityLabel: body.name });
    revalidatePublicSite();
    return ok({ id: String(doc._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// PUT — bulk reorder { ids: [] }
export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
    await connectDb();
    await Promise.all(ids.map((id, i) => ProductModel.updateOne({ _id: id }, { $set: { order: i } })));
    await auditService.record({ actor: user, action: "products.reordered", entityType: "product" });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
