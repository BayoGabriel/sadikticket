import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { settingsService } from "@/services/settingsService";
import { SettingsClient } from "@/components/admin/settings/SettingsClient";

export const metadata: Metadata = { title: "Site settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requirePermission("settings");
  const s = await settingsService.getPublic();
  const env = {
    paystackConfigured: Boolean(process.env.PAYSTACK_SECRET_KEY),
    paystackLive: (process.env.PAYSTACK_SECRET_KEY ?? "").startsWith("sk_live"),
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    cronConfigured: Boolean(process.env.CRON_SECRET),
    storageConfigured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
  };
  return (
    <>
      <PageHeader
        title="Site settings"
        subtitle="Contact details, notifications and the small print — changes go live straight away."
      />
      <SettingsClient initial={s} env={env} />
    </>
  );
}
