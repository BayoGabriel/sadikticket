import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { EmailLogModel, type EmailLog } from "@/models/emailLog";
import { emailTemplateService } from "@/services/emailTemplateService";

// GET — templates + recent log + filter params.
export async function GET(req: NextRequest) {
  try {
    await requirePermission("emails");
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = 20;
    const filter: Record<string, unknown> = {};
    if (sp.get("status")) filter.status = sp.get("status");
    if (sp.get("template")) filter.template = sp.get("template");
    if (sp.get("q")) filter.to = { $regex: sp.get("q"), $options: "i" };

    await connectDb();
    const [templates, items, total] = await Promise.all([
      emailTemplateService.list(),
      EmailLogModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean<EmailLog[]>(),
      EmailLogModel.countDocuments(filter),
    ]);
    return ok({
      templates: templates.map((t) => ({
        key: t.key,
        name: t.name,
        description: t.description,
        subject: t.subject,
        body: t.body,
        enabled: t.enabled,
        timingDays: t.timingDays,
      })),
      items: items.map((l) => ({
        id: String(l._id),
        to: l.to,
        subject: l.subject,
        template: l.template ?? "",
        status: l.status,
        error: l.error ?? "",
        createdAt: l.createdAt,
      })),
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      total,
      smtpConfigured: Boolean(process.env.SMTP_HOST),
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const templateSchema = z.object({
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(20000),
  enabled: z.boolean().optional(),
  timingDays: z.number().int().min(0).max(30).optional(),
});

// PUT /api/v1/admin/emails — update a template { key, ... }
export async function PUT(req: NextRequest) {
  try {
    await requirePermission("emails");
    const { key, ...rest } = z.object({ key: z.string() }).and(templateSchema).parse(await req.json());
    await emailTemplateService.update(key, rest);
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
