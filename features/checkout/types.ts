export type OrderStatus = 'PENDING' | 'PAYMENT_PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type OrderStatusPayload = {
  found: boolean;
  id?: string;
  kind?: "event" | "shop";
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  event?: { id: string; name: string; slug: string };
  // Shop orders — items bought instead of tickets.
  items?: { name: string; quantity: number; unitPrice: number }[];
  total?: number;
  tickets?: Array<{
    id: string;
    ticketCode: string;
    ticketTypeId: string;
    qrToken: string;
    status: string;
  }>;
};
