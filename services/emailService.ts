import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { connectDb } from '@/lib/db';
import { EmailLogModel } from '@/models/emailLog';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

function textToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export const emailService = {
  // Generic send — every email through the system is logged to EmailLog.
  async send(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    template?: string;
    meta?: Record<string, unknown>;
  }) {
    const html = params.html ?? textToHtml(params.text ?? '');
    const logEntry = {
      to: params.to,
      subject: params.subject,
      template: params.template,
      body: params.text ?? params.html ?? '',
      meta: params.meta,
    };

    if (!env.SMTP_HOST) {
      await EmailLogModel.create({ ...logEntry, status: 'FAILED', error: 'SMTP not configured' }).catch(() => {});
      return { queued: false, failed: true } as const;
    }

    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: params.to,
        subject: params.subject,
        html,
      });
      await EmailLogModel.create({ ...logEntry, status: 'SENT' }).catch(() => {});
      return info;
    } catch (e) {
      await EmailLogModel.create({
        ...logEntry,
        status: 'FAILED',
        error: (e as Error).message,
      }).catch(() => {});
      throw e;
    }
  },

  // Legacy name used by the ticket flow — kept for compatibility.
  async sendTicketEmail(params: { to: string; subject: string; html: string }) {
    return this.send({ ...params, template: 'ticket-confirmation' });
  },

  async resend(logId: string) {
    await connectDb();
    const { EmailLogModel: Log } = await import('@/models/emailLog');
    const log = await Log.findById(logId).lean<{ to: string; subject: string; body?: string; template?: string } | null>();
    if (!log) throw new Error('Email not found');
    return this.send({
      to: log.to,
      subject: log.subject,
      text: log.body || ' ',
      template: log.template,
    });
  },
};
