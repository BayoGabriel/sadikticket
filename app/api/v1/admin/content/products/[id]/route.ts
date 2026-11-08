import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/models/product";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { productSchema } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    const body = productSchema.partial().parse(await req.json());
    await connectDb();
    await ProductModel.updateOne({ _id: id }, { $set: body });
    await auditService.record({ actor: user, action: "product.updated", entityType: "product", entityId: id, entityLabel: body.name ?? id });
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
    await ProductModel.deleteOne({ _id: id });
    await auditService.record({ actor: user, action: "product.deleted", entityType: "product", entityId: id });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
