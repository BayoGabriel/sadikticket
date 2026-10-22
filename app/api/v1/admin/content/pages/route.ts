import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { contentService } from "@/services/contentService";
import { sanitizeHtml } from "@/lib/sanitize";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

const PAGES = [
  { key: "refunds", title: "Refunds and Cancellations", path: "/refunds" },
  { key: "terms", title: "Terms", path: "/terms" },
  { key: "privacy", title: "Privacy", path: "/privacy" },
  { key: "about", title: "About intro text", path: "/about" },
];

// GET — the four editable pages, their current content + recent versions.
export async function GET() {
  try {
    await requirePermission("content");
    const pages = await Promise.all(
      PAGES.map(async (p) => {
        const current = await contentService.page(p.key);
        const versions = await contentService.pageVersions(p.key);
        return { ...p, content: current?.content ?? "", lastUpdatedAt: current?.lastUpdatedAt ?? null, versions };
      }),
    );
    return ok({ items: pages });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const saveSchema = z.object({
  key: z.enum(["refunds", "terms", "privacy", "about"]),
  content: z.string().max(40000),
});

// PUT — save a new version (sanitized; last 10 versions kept for restore).
export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const { key, content } = saveSchema.parse(await req.json());
    await contentService.savePage(key, sanitizeHtml(content), user.email ?? "admin");
    await auditService.record({ actor: user, action: "page.saved", entityType: "page", entityId: key });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
