import crypto from 'crypto';
import axios from 'axios';
import { env } from '@/lib/env';

const PAYSTACK_API = 'https://api.paystack.co';

export type PaystackInitResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export const paystackService = {
  async initializePayment(params: { email: string; amountKobo: number; reference: string; currency: string; callback_url?: string; metadata?: Record<string, any>; }) {
    const res = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        currency: params.currency,
        callback_url: params.callback_url,
        metadata: params.metadata,
      },
      { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } }
    );
    return res.data.data as PaystackInitResponse;
  },

  async verify(reference: string) {
    const res = await axios.get(`${PAYSTACK_API}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
    });
    return res.data.data as any;
  },

  isValidSignature(rawBody: string, signature: string | null | undefined) {
    if (!signature) return false;
    const hash = crypto.createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
    return hash === signature;
  },
};
