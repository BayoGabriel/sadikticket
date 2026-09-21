import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const emailService = {
  async sendTicketEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!env.SMTP_HOST) return { accepted: [], rejected: ['smtp-not-configured'] } as any;
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return info;
  },
};
