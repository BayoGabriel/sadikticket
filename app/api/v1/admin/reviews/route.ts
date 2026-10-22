import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ReviewModel } from "@/models/review";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const reviewSchema = z.object({
  name: z.string().min(1).max(120),
  context: z.string().max(160).optional(),
  kind: z.enum(["guest", "client"]).default("guest"),
  text: z.string().min(1).max(2000),
  shortText: z.string().max(400).optional(),
  photo: z.string().max(500).optional(),
  source: z.enum(["written", "whatsapp", "instagram", "verbal", "other"]).default("written"),
  permissionConfirmed: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  approved: z.boolean().optional(),
  company: z.string().max(160).optional(),
  role: z.string().max(120).optional(),
  logo: z.string().max(500).optional(),
});

function serialize(r: Record<string, unknown> & { _id: unknown }) {
  return {
    id: String(r._id),
    name: r.name,
    context: r.context ?? "",
    kind: r.kind,
    text: r.text,
    shortText: r.shortText ?? "",
    photo: r.photo ?? "",
    source: r.source ?? "written",
    permissionConfirmed: Boolean(r.permissionConfirmed),
    featured: Boolean(r.featured),
    order: r.order ?? 0,
    approved: Boolean(r.approved),
    company: r.company ?? "",
    role: r.role ?? "",
    logo: r.logo ?? "",
    createdAt: r.createdAt,
  };
}

// GET /api/v1/admin/reviews
export async function GET() {
  try {
    await requirePermission("reviews");
    await connectDb();
    const items = await ReviewModel.find().sort({ order: 1, createdAt: -1 }).lean();
    return ok({ items: items.map(serialize) });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST /api/v1/admin/reviews — add a real review manually
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("reviews");
    const input = reviewSchema.parse(await req.json());
    await connectDb();
    const doc = await ReviewModel.create(input);
    await auditService.record({ actor: user, action: "review.created", entityType: "review", entityId: String(doc._id), entityLabel: input.name });
    revalidatePublicSite();
    return ok({ id: String(doc._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// PUT — bulk reorder { ids: [] }
export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("reviews");
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
    await connectDb();
    await Promise.all(ids.map((id, i) => ReviewModel.updateOne({ _id: id }, { $set: { order: i } })));
    await auditService.record({ actor: user, action: "reviews.reordered", entityType: "review" });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
