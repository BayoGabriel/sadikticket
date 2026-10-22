import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { emailTemplateService } from "@/services/emailTemplateService";
import { emailService } from "@/services/emailService";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("test"), key: z.string(), to: z.string().email() }),
  z.object({ action: z.literal("resend"), logId: z.string() }),
  z.object({ action: z.literal("toggle"), key: z.string(), enabled: z.boolean() }),
]);

// POST /api/v1/admin/emails/actions — test sends, resends, enable/disable.
export async function POST(req: NextRequest) {
  try {
    await requirePermission("emails");
    const input = actionSchema.parse(await req.json());
    if (input.action === "test") {
      await emailTemplateService.sendTest(input.key, input.to);
      return ok({ sent: true });
    }
    if (input.action === "resend") {
      await emailService.resend(input.logId);
      return ok({ sent: true });
    }
    await emailTemplateService.update(input.key, { enabled: input.enabled });
    return ok({ done: true });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
