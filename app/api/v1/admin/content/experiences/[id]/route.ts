import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";
import { experienceSchema } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requirePermission("content");
    const { id } = await params;
    const body = experienceSchema.partial().parse(await req.json());
    await contentService.saveExperience(id, body);
    await auditService.record({ actor: user, action: "experience.updated", entityType: "experience", entityId: id, entityLabel: body.name ?? id });
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
    await contentService.deleteExperience(id);
    await auditService.record({ actor: user, action: "experience.deleted", entityType: "experience", entityId: id });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
