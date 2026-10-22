import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ClientModel, type Client } from "@/models/client";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

export const clientSchema = z.object({
  name: z.string().min(1).max(160),
  engagement: z.string().max(160).default(""),
  description: z.string().max(1000).default(""),
  photo: z.string().max(500).default(""),
  logo: z.string().max(500).default(""),
  quote: z.string().max(600).default(""),
  approvalConfirmed: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export async function GET() {
  try {
    await requirePermission("content");
    await connectDb();
    const items = await ClientModel.find().sort({ order: 1, createdAt: 1 }).lean<Client[]>();
    return ok({ items: items.map((c) => ({ ...c, id: String(c._id) })) });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const body = clientSchema.parse(await req.json());
    await connectDb();
    const doc = await ClientModel.create(body);
    await auditService.record({ actor: user, action: "client.created", entityType: "client", entityId: String(doc._id), entityLabel: body.name });
    revalidatePublicSite();
    return ok({ id: String(doc._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("content");
    const { ids } = z.object({ ids: z.array(z.string()).min(1) }).parse(await req.json());
    await connectDb();
    await Promise.all(ids.map((id, i) => ClientModel.updateOne({ _id: id }, { $set: { order: i } })));
    await auditService.record({ actor: user, action: "clients.reordered", entityType: "client" });
    revalidatePublicSite();
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
