import { paystackService } from "@/services/paystackService";
import type {
  InitPaymentParams,
  InitPaymentResult,
  PaymentProvider,
  VerifyResult,
} from "./types";

export const paystackProvider: PaymentProvider = {
  name: "paystack",
  initializePayment(p: InitPaymentParams): Promise<InitPaymentResult> {
    return paystackService.initializePayment(p);
  },
  verify(reference: string): Promise<VerifyResult> {
    return paystackService.verify(reference);
  },
};
