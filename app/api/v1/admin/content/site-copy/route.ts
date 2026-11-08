import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

const patchSchema = z.object({
  key: z.string().min(1),
  value: z.string().max(4000).nullable(), // null = reset to default
});

export async function GET() {
  try {
    await requirePermission("content");
    const items = await contentService.adminSiteContent();
    return ok({ items });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// PATCH { key, value } — upserts an override; value null resets to default.
export async function PATCH(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = patchSchema.parse(await req.json());
    await contentService.saveSiteContent(body.key, body.value);
    await auditService.record({
      actor: user,
      action: body.value === null ? "site-copy.reset" : "site-copy.updated",
      entityType: "siteContent",
      entityId: body.key,
      entityLabel: body.key,
    });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
