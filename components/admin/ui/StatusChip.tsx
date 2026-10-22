// One status colour system used across the whole admin:
// on-sale/featured = orange · few-left/paid/good = green · sold-out/refunded = grey
// coming-soon = outline · draft = dashed · pending = amber · failed/spam = red
const MAP: Record<string, { cls: string; label?: string }> = {
  "on-sale": { cls: "a-chip-orange", label: "On sale" },
  "few-left": { cls: "a-chip-green", label: "Few tickets left" },
  "sold-out": { cls: "a-chip-grey", label: "Sold out" },
  "coming-soon": { cls: "a-chip-outline", label: "Coming soon" },
  "past": { cls: "a-chip-grey", label: "Past" },
  DRAFT: { cls: "a-chip-dashed", label: "Draft" },
  PUBLISHED: { cls: "a-chip-orange", label: "Published" },
  SCHEDULED: { cls: "a-chip-outline", label: "Scheduled" },
  ARCHIVED: { cls: "a-chip-grey", label: "Archived" },
  CANCELLED: { cls: "a-chip-red", label: "Cancelled" },
  COMPLETED: { cls: "a-chip-grey", label: "Completed" },
  PAID: { cls: "a-chip-green", label: "Paid" },
  PENDING: { cls: "a-chip-amber", label: "Pending" },
  PAYMENT_PROCESSING: { cls: "a-chip-amber", label: "Processing" },
  REFUNDED: { cls: "a-chip-grey", label: "Refunded" },
  FAILED: { cls: "a-chip-red", label: "Failed" },
  EXPIRED: { cls: "a-chip-grey", label: "Expired" },
  ISSUED: { cls: "a-chip-green", label: "Issued" },
  CHECKED_IN: { cls: "a-chip-green", label: "Checked in" },
  VOID: { cls: "a-chip-grey", label: "Void" },
  waiting: { cls: "a-chip-amber", label: "Waiting" },
  notified: { cls: "a-chip-orange", label: "Notified" },
  converted: { cls: "a-chip-green", label: "Got a ticket" },
  removed: { cls: "a-chip-grey", label: "Removed" },
  new: { cls: "a-chip-orange", label: "New" },
  contacted: { cls: "a-chip-green", label: "Contacted" },
  quote_sent: { cls: "a-chip-amber", label: "Quote sent" },
  confirmed: { cls: "a-chip-green", label: "Confirmed" },
  done: { cls: "a-chip-grey", label: "Done" },
  lost: { cls: "a-chip-grey", label: "Lost" },
  spam: { cls: "a-chip-red", label: "Spam" },
  active: { cls: "a-chip-green", label: "Active" },
  inactive: { cls: "a-chip-grey", label: "Inactive" },
  subscribed: { cls: "a-chip-green", label: "Subscribed" },
  unsubscribed: { cls: "a-chip-grey", label: "Unsubscribed" },
  approved: { cls: "a-chip-green", label: "Approved" },
  hidden: { cls: "a-chip-grey", label: "Hidden" },
  pending_review: { cls: "a-chip-amber", label: "Pending" },
  manual: { cls: "a-chip-outline", label: "Manual" },
  SENT: { cls: "a-chip-green", label: "Sent" },
  QUEUED: { cls: "a-chip-amber", label: "Queued" },
};

export function StatusChip({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const s = MAP[status] ?? { cls: "a-chip-grey" };
  return <span className={`a-chip ${s.cls}`}>{label ?? s.label ?? status}</span>;
}
