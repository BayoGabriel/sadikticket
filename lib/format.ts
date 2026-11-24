// Prices are stored in kobo (lowest currency unit) everywhere in the DB.
export function formatNaira(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
}

// Human message for a Paystack verify result — used wherever re-verification
// is triggered (orders list, order detail).
export function describeVerifyResult(r: {
  status: string;
  expected?: { amount: number; currency: string };
  received?: { amount: number; currency: string };
}): string {
  switch (r.status) {
    case "PAID":
      return "Payment confirmed — tickets issued.";
    case "AMOUNT_MISMATCH": {
      const got = r.received
        ? `${formatNaira(r.received.amount)} ${r.received.currency}`
        : "a payment";
      const want = r.expected
        ? `${formatNaira(r.expected.amount)} ${r.expected.currency}`
        : "a different amount";
      return `Paystack confirms ${got} was paid, but this order totals ${want} — the payment is short or in the wrong currency. To resolve: collect the balance and "Mark as paid", or refund and ask the buyer to repay the correct amount.`;
    }
    case "UNPAID":
      return "Paystack has no successful payment for this order yet — the buyer may still be checking out or abandoned it.";
    case "ORDER_NOT_FOUND":
      return "No order found for that payment reference.";
    default:
      return `Paystack says: ${r.status}`;
  }
}

export function formatEventDate(iso: string | Date): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatEventTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}
