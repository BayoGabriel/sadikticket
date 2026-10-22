import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { FaqModel } from "@/models/faq";
import { contentService } from "@/services/contentService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const faqSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(4000),
  category: z.string().max(60).default("General"),
  topics: z.array(z.string().max(60)).max(20).default([]),
  showOnEventPages: z.boolean().default(true),
  priority: z.number().int().default(0),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requirePermission("content");
    const items = await contentService.adminFaqs();
    return ok({ items });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = faqSchema.parse(await req.json());
    await connectDb();
    const doc = await FaqModel.create({ ...body, needsAnswer: /\[your/i.test(body.answer) });
    await auditService.record({ actor: user, action: "faq.created", entityType: "faq", entityId: String(doc._id), entityLabel: body.question });
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
    await Promise.all(ids.map((id, i) => FaqModel.updateOne({ _id: id }, { $set: { order: i } })));
    await auditService.record({ actor: user, action: "faqs.reordered", entityType: "faq" });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
