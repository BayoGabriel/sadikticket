import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { checkinService } from "@/services/checkinService";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { PrintButton } from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

// Attendee list for one event — printable + CSV export.
export default async function EventAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { eventId } = await params;
  const { q } = await searchParams;

  await connectDb();
  const event = await EventModel.findById(eventId).lean<{ name: string; slug: string } | null>();
  if (!event) notFound();
  const state = await checkinService.eventState(eventId, q || undefined);

  return (
    <div>
      <PageHeader
        title={`Attendees — ${event.name}`}
        subtitle={`${state.total} tickets · ${state.checkedIn} checked in · ${state.remaining} to arrive`}
      >
        <a href={`/api/v1/admin/attendees?event=${eventId}&format=csv`} className="a-btn a-btn-ghost a-btn-sm">CSV</a>
        <PrintButton />
        <Link href={`/admin/check-in?event=${eventId}`} className="a-btn a-btn-orange a-btn-sm">Check in</Link>
      </PageHeader>

      {state.attendees.length === 0 ? (
        <EmptyState icon="ticket" title="Nobody on the list yet." body="Paid orders land here — one row per ticket." />
      ) : (
        <AdminTable
          rows={state.attendees}
          rowKey={(a) => a.id}
          renderCard={(a) => (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{a.name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{a.type} · {a.code}</p>
                </div>
                <StatusChip status={a.status === "CHECKED_IN" ? "CHECKED_IN" : a.status === "VOID" ? "REFUNDED" : "ISSUED"} />
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{a.email}{a.phone ? ` · ${a.phone}` : ""}</p>
            </div>
          )}
          columns={[
            { label: "Code", render: (a) => <span className="font-mono text-sm">{a.code}</span> },
            { label: "Name", render: (a) => <span className="font-semibold">{a.name}</span> },
            { label: "Ticket", render: (a) => a.type },
            { label: "Email", render: (a) => <span className="text-sm">{a.email}</span> },
            { label: "Phone", render: (a) => a.phone || "—" },
            {
              label: "Status",
              render: (a) => <StatusChip status={a.status === "CHECKED_IN" ? "CHECKED_IN" : a.status === "VOID" ? "REFUNDED" : "ISSUED"} />,
            },
            {
              label: "Checked in",
              render: (a) => (a.checkedInAt ? format(new Date(a.checkedInAt), "d MMM, h:mma") : "—"),
            },
          ]}
        />
      )}
    </div>
  );
}
