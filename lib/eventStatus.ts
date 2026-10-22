// Status logic shared by the public event page and the admin list —
// one source of truth for Coming soon / On sale / Few left / Sold out.
export type EventStatusLabel =
  | "Coming soon"
  | "Tickets on sale"
  | "Few tickets left"
  | "Sold out"
  | "Draft"
  | "Cancelled";

export type SaleWindowTicket = {
  isOnSale?: boolean;
  salesStart?: Date | string | null;
  salesEnd?: Date | string | null;
  quantityAvailable?: number;
};

export function isOnSaleNow(t: SaleWindowTicket, now: Date): boolean {
  return (
    t.isOnSale !== false &&
    (!t.salesStart || new Date(t.salesStart) <= now) &&
    (!t.salesEnd || new Date(t.salesEnd) >= now)
  );
}

export function eventStatusLabel(args: {
  statusOverride?: string | null;
  eventStatus?: string;
  ticketTypes: SaleWindowTicket[];
  fewLeftThreshold?: number;
  now?: Date;
}): EventStatusLabel {
  const now = args.now ?? new Date();
  const fewLeft = args.fewLeftThreshold ?? 10;

  if (args.eventStatus === "DRAFT") return "Draft";
  if (args.eventStatus === "CANCELLED") return "Cancelled";

  const override = args.statusOverride;
  if (override === "coming-soon" || override === "sold-out" || override === "few-left") {
    return { "coming-soon": "Coming soon", "sold-out": "Sold out", "few-left": "Few tickets left" }[override] as EventStatusLabel;
  }
  if (override === "on-sale") return "Tickets on sale";

  const onSaleTypes = args.ticketTypes.filter((t) => isOnSaleNow(t, now));
  const remaining = onSaleTypes.reduce((acc, t) => acc + (t.quantityAvailable ?? 0), 0);

  if (args.ticketTypes.length === 0 || onSaleTypes.length === 0) return "Coming soon";
  if (remaining <= 0) return "Sold out";
  if (remaining <= fewLeft) return "Few tickets left";
  return "Tickets on sale";
}
