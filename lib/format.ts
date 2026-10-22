// Prices are stored in kobo (lowest currency unit) everywhere in the DB.
export function formatNaira(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
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
