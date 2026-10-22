import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ReviewModel } from "@/models/review";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  context: z.string().max(160).optional(),
  kind: z.enum(["guest", "client"]).default("guest"),
  text: z.string().min(1).max(2000),
  approved: z.boolean().optional(),
});

// GET /api/v1/admin/reviews
export async function GET() {
  try {
    await requirePermission("reviews");
    await connectDb();
    const items = await ReviewModel.find().sort({ createdAt: -1 }).lean();
    return ok({
      items: items.map((r) => ({
        id: String(r._id),
        name: r.name,
        context: r.context ?? "",
        kind: r.kind,
        text: r.text,
        approved: r.approved,
      })),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

// POST /api/v1/admin/reviews — add a real review manually
export async function POST(req: NextRequest) {
  try {
    await requirePermission("reviews");
    const input = createSchema.parse(await req.json());
    const doc = await ReviewModel.create(input);
    return ok({ id: String(doc._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
