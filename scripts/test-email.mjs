// Test the SMTP config in .env — sends a real email without touching the
// database or creating orders.
// Usage: node --env-file=.env scripts/test-email.mjs you@example.com
import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.log("Usage: node --env-file=.env scripts/test-email.mjs you@example.com");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

if (!process.env.SMTP_HOST) {
  console.log("SMTP_HOST is not set — the app would log 'SMTP not configured' and silently mark tickets FAILED.");
  process.exit(1);
}

try {
  await transporter.verify();
  console.log(`SMTP OK — ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587} (auth: ${process.env.SMTP_USER || "none"})`);
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Tickets <no-reply@example.com>",
    to,
    subject: "Ticket app — SMTP test",
    html: `<p>If you're reading this, the email path works end to end.</p><p><em>Sent ${new Date().toISOString()} via ${process.env.SMTP_HOST}</em></p>`,
  });
  console.log(`Sent to ${to} — messageId ${info.messageId}`);
} catch (e) {
  console.log("FAILED:", e.message);
  process.exit(1);
}
