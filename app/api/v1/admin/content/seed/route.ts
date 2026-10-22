import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

// POST — copy the starter catalogue (experiences, FAQs, gallery placeholders)
// into the DB so the admin can edit them. Only fills empty collections.
export async function POST() {
  try {
    const user = await requirePermission("content");
    const { seeded } = await contentService.seedIfEmpty();
    await auditService.record({ actor: user, action: "content.seeded", entityLabel: seeded.join(", ") || "nothing" });
    revalidatePublicSite();
    return ok({ seeded });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
