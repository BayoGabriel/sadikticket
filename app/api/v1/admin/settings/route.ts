import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { settingsService } from "@/services/settingsService";
import { auditService } from "@/services/auditService";
import { revalidatePublicSite } from "@/lib/revalidate";

const settingsSchema = z.object({
  whatsappNumber: z.string().max(30).optional(),
  contactEmail: z.union([z.literal(""), z.string().email()]).optional(),
  businessEmail: z.union([z.literal(""), z.string().email()]).optional(),
  instagramHandle: z.string().max(60).optional(),
  enquiryNotifyEmails: z.array(z.string().email()).max(10).optional(),
  responseTime: z.string().max(80).optional(),
  cities: z.array(z.string().min(1).max(60)).min(1).max(10).optional(),
  fewLeftThreshold: z.number().int().min(0).max(500).optional(),
  stickyMobileBanner: z.boolean().optional(),
  announcementEnabled: z.boolean().optional(),
  announcementText: z.string().max(200).optional(),
  refundSummary: z.string().max(400).optional(),
  policies: z
    .object({
      ageLimit: z.string().max(300).default(""),
      whatToWear: z.string().max(300).default(""),
      runningLate: z.string().max(300).default(""),
    })
    .optional(),
});

export async function GET() {
  try {
    await requirePermission("settings");
    const s = await settingsService.get();
    return ok({
      settings: {
        whatsappNumber: s.whatsappNumber ?? "",
        contactEmail: s.contactEmail ?? "",
        businessEmail: s.businessEmail ?? "",
        instagramHandle: s.instagramHandle ?? "",
        enquiryNotifyEmails: s.enquiryNotifyEmails ?? [],
        responseTime: s.responseTime ?? "within a day",
        cities: s.cities ?? ["Lagos", "Benin City"],
        fewLeftThreshold: s.fewLeftThreshold ?? 10,
        stickyMobileBanner: s.stickyMobileBanner ?? true,
        announcementEnabled: s.announcementEnabled ?? false,
        announcementText: s.announcementText ?? "",
        refundSummary: s.refundSummary ?? "",
        policies: s.policies ?? { ageLimit: "", whatToWear: "", runningLate: "" },
      },
      env: {
        // Indicators only — never values.
        paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
        paystackLive: (process.env.PAYSTACK_SECRET_KEY ?? "").startsWith("sk_live"),
        smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
        cronConfigured: Boolean(process.env.CRON_SECRET),
        storageConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      },
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requirePermission("settings");
    const input = settingsSchema.parse(await req.json());
    const saved = await settingsService.update(input);
    await auditService.record({
      actor: user,
      action: "settings.updated",
      entityType: "settings",
      entityLabel: Object.keys(input).join(", "),
    });
    revalidatePublicSite();
    return ok({ settings: saved });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
