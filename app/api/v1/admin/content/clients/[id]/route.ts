import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ClientModel } from "@/models/client";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { clientSchema } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    const body = clientSchema.partial().parse(await req.json());
    await connectDb();
    await ClientModel.updateOne({ _id: id }, { $set: body });
    await auditService.record({ actor: user, action: "client.updated", entityType: "client", entityId: id, entityLabel: body.name ?? id });
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
    await ClientModel.deleteOne({ _id: id });
    await auditService.record({ actor: user, action: "client.deleted", entityType: "client", entityId: id });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
