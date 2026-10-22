import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { emailTemplateService } from "@/services/emailTemplateService";
import { connectDb } from "@/lib/db";
import { EmailLogModel, type EmailLog } from "@/models/emailLog";
import { EmailsClient } from "@/components/admin/settings/EmailsClient";

export const metadata: Metadata = { title: "Emails" };
export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  const user = await requirePermission("emails");
  const templates = await emailTemplateService.list();
  await connectDb();
  const logs = await EmailLogModel.find().sort({ createdAt: -1 }).limit(20).lean<EmailLog[]>();
  return (
    <>
      <PageHeader
        title="Emails"
        subtitle="What guests receive — edit the wording, send yourself a test, and see every email we've sent."
      />
      <EmailsClient
        me={user.email}
        templates={templates.map((t) => ({
          key: t.key,
          name: t.name,
          description: t.description,
          subject: t.subject,
          body: t.body,
          enabled: t.enabled,
          timingDays: t.timingDays,
        }))}
        initialLog={logs.map((l) => ({
          id: String(l._id),
          to: l.to,
          subject: l.subject,
          template: l.template ?? "",
          status: l.status,
          error: l.error ?? "",
          createdAt: new Date(l.createdAt).toISOString(),
        }))}
        smtpConfigured={Boolean(process.env.SMTP_HOST)}
      />
    </>
  );
}
