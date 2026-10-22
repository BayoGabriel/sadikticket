// Payment provider seam — the app talks to this interface so Flutterwave
// (or anything else) can be swapped in via the PAYMENT_PROVIDER env var.

export type InitPaymentParams = {
  email: string;
  amountKobo: number;
  reference: string;
  currency: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
};

export type InitPaymentResult = {
  authorization_url: string;
  access_code?: string;
  reference: string;
};

export type VerifyResult = {
  status: string; // provider's status string; "success" means paid
  amount: number; // kobo
  currency: string;
  paid_at?: string;
  [key: string]: unknown;
};

export interface PaymentProvider {
  name: string;
  initializePayment(p: InitPaymentParams): Promise<InitPaymentResult>;
  verify(reference: string): Promise<VerifyResult>;
}
