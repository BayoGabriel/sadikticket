export type OrderStatus = 'PENDING' | 'PAYMENT_PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type OrderStatusPayload = {
  found: boolean;
  id?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  event?: { id: string; name: string; slug: string };
  tickets?: Array<{
    id: string;
    ticketCode: string;
    ticketTypeId: string;
    qrToken: string;
    status: string;
  }>;
};
