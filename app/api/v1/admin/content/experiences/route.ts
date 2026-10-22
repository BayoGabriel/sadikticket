import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { ApiError } from "@/lib/errors";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const experienceSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  name: z.string().min(1).max(160),
  category: z.enum(["creative", "social", "outdoor"]),
  oneLiner: z.string().max(300).default(""),
  heroImage: z.string().max(500).default(""),
  gallery: z.array(z.string().max(500)).max(20).default([]),
  whatItIs: z.string().max(6000).default(""), // paragraphs separated by blank lines
  whatToExpect: z.array(z.string().max(300)).max(30).default([]),
  whoItSuits: z.array(z.string().max(60)).max(20).default([]),
  addOns: z.array(z.string().max(120)).max(30).default([]),
  eventType: z.string().max(60).default(""),
  eventTags: z.array(z.string().max(60)).max(20).default([]),
  wide: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requirePermission("content");
    const items = await contentService.adminExperiences();
    return ok({ items });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = experienceSchema.parse(await req.json());
    const id = await contentService.saveExperience(null, body);
    await auditService.record({ actor: user, action: "experience.created", entityType: "experience", entityId: id, entityLabel: body.name });
    revalidatePublicSite();
    return ok({ id }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// PUT — bulk reorder: { ids: [string] } — index becomes `order`.
export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
    await contentService.reorder(ids);
    await auditService.record({ actor: user, action: "experiences.reordered", entityType: "experience", entityLabel: `${ids.length} experiences` });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
