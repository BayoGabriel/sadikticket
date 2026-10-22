import type { PaymentProvider } from "./types";
import { paystackProvider } from "./paystack";

// Swap providers with PAYMENT_PROVIDER=paystack|flutterwave.
// Flutterwave isn't implemented yet — add services/payments/flutterwave.ts
// implementing PaymentProvider and register it here.
export function getPaymentProvider(): PaymentProvider {
  switch ((process.env.PAYMENT_PROVIDER || "paystack").toLowerCase()) {
    case "paystack":
    default:
      return paystackProvider;
  }
}
