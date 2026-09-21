import { TicketModel } from '@/models/ticket';
import { EventModel } from '@/models/event';
import { TicketTypeModel } from '@/models/ticketType';
import { emailService } from './emailService';
import { qrCodeService } from './qrCodeService';
import { env } from '@/lib/env';
import { connectDb } from '@/lib/db';

function ticketVerifyUrl(token: string) {
  return `${env.APP_URL}/ticket/verify/${token}`;
}

function ticketEmailHtml(params: {
  eventName: string;
  venueName?: string;
  startsAt: Date;
  holderName: string;
  ticketType: string;
  ticketCode: string;
  qrDataUrl: string;
}) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111">
    <h2>Your ticket for ${params.eventName}</h2>
    <p><strong>Ticket holder:</strong> ${params.holderName}</p>
    <p><strong>Type:</strong> ${params.ticketType}</p>
    <p><strong>Ticket code:</strong> ${params.ticketCode}</p>
    <p><img src="${params.qrDataUrl}" alt="QR Code" style="width:200px;height:200px" /></p>
    <p>Show this QR at the entrance. Keep this email safe.</p>
  </div>`;
}

export const ticketEmailService = {
  async sendAllForOrder(orderId: string) {
    await connectDb();
    const tickets = await TicketModel.find({ orderId, emailStatus: { $ne: 'SENT' } }).lean();
    if (tickets.length === 0) return { sent: 0 };

    const event = await EventModel.findById(tickets[0].eventId).lean();
    const types = await TicketTypeModel.find({ _id: { $in: tickets.map((t) => t.ticketTypeId) } }).lean();

    let sent = 0;
    for (const t of tickets) {
      const type = types.find((x) => x._id.toString() === t.ticketTypeId.toString());
      const url = ticketVerifyUrl(t.qrToken);
      const qrDataUrl = await qrCodeService.toDataUrl(url);
      const html = ticketEmailHtml({
        eventName: event?.name ?? 'Your Event',
        venueName: event?.venueName,
        startsAt: event?.startsAt ?? new Date(),
        holderName: t.holderName,
        ticketType: type?.name ?? 'Ticket',
        ticketCode: t.ticketCode,
        qrDataUrl,
      });

      try {
        await emailService.sendTicketEmail({
          to: t.holderEmail,
          subject: `Your ticket for ${event?.name ?? 'event'}`,
          html,
        });
        await TicketModel.updateOne({ _id: t._id }, { $set: { emailStatus: 'SENT', emailedAt: new Date() } });
        sent += 1;
      } catch {
        await TicketModel.updateOne({ _id: t._id }, { $set: { emailStatus: 'FAILED' } });
      }
    }

    return { sent };
  },
};
