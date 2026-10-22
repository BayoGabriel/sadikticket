import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { FaqModel } from "@/models/faq";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { faqSchema } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    const body = faqSchema.partial().parse(await req.json());
    const set: Record<string, unknown> = { ...body };
    if (body.answer !== undefined) set.needsAnswer = /\[your/i.test(body.answer);
    await connectDb();
    await FaqModel.updateOne({ _id: id }, { $set: set });
    await auditService.record({ actor: user, action: "faq.updated", entityType: "faq", entityId: id, entityLabel: body.question ?? id });
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
    await FaqModel.deleteOne({ _id: id });
    await auditService.record({ actor: user, action: "faq.deleted", entityType: "faq", entityId: id });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
