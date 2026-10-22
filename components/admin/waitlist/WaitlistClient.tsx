"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { Modal } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

type Entry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  eventId: string;
  eventName: string;
  status: string;
  createdAt: string;
  notifiedAt?: string;
};

export function WaitlistClient({
  events,
  items,
  selectedEvent,
  freed,
}: {
  events: { id: string; name: string; startsAt: string; waiting: number }[];
  items: Entry[];
  selectedEvent: string;
  freed: { freed: number; waiting: number } | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyCount, setNotifyCount] = useState("5");
  const [busy, setBusy] = useState(false);

  const waitingCount = items.filter((i) => i.status === "waiting").length;

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function notify(count?: number) {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notify", eventId: selectedEvent, count }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Couldn't send");
      toast(`Told ${d.data.notified} ${d.data.notified === 1 ? "person" : "people"} a spot opened.`);
      setNotifyOpen(false);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", ids: [...selected] }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast(`Removed ${selected.size} ${selected.size === 1 ? "person" : "people"}.`);
      setSelected(new Set());
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {freed && freed.freed > 0 && freed.waiting > 0 && (
        <div className="a-card mb-4 flex flex-wrap items-center gap-3 px-4 py-3" style={{ background: "var(--mint)" }}>
          <p className="text-sm font-bold">
            {freed.freed} {freed.freed === 1 ? "ticket" : "tickets"} freed up — {freed.waiting} {freed.waiting === 1 ? "person is" : "people are"} waiting.
          </p>
          <button className="a-btn a-btn-orange a-btn-sm ml-auto" onClick={() => setNotifyOpen(true)}>
            Notify the waitlist
          </button>
        </div>
      )}
      {/* Event selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="a-select"
          style={{ width: "auto" }}
          value={selectedEvent}
          onChange={(e) => router.push(e.target.value ? `/admin/waitlist?event=${e.target.value}` : "/admin/waitlist")}
          aria-label="Pick an event"
        >
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}{e.waiting ? ` (${e.waiting} waiting)` : ""}</option>
          ))}
        </select>
        <a href={`/api/v1/admin/waitlist?format=csv${selectedEvent ? `&event=${selectedEvent}` : ""}`} className="a-btn a-btn-ghost a-btn-sm">
          <Icon name="download" size={14} /> CSV
        </a>
        {selectedEvent && waitingCount > 0 && (
          <button className="a-btn a-btn-orange a-btn-sm" onClick={() => setNotifyOpen(true)}>
            <Icon name="send" size={14} /> Notify next people
          </button>
        )}
        {selected.size > 0 && (
          <button className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }} disabled={busy} onClick={removeSelected}>
            Remove {selected.size}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Nobody waiting."
          body="When an event sells out, guests can join the waitlist from the event page — they'll show up here."
        />
      ) : (
        <AdminTable
          rows={items}
          rowKey={(w) => w.id}
          renderCard={(w) => (
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="h-5 w-5" checked={selected.has(w.id)} onChange={() => toggle(w.id)} aria-label={`Select ${w.name}`} />
                <div>
                  <p className="font-bold">{w.name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{w.eventName} · joined {format(new Date(w.createdAt), "d MMM, h:mma")}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{w.email}{w.phone ? ` · ${w.phone}` : ""}</p>
                </div>
              </label>
              <StatusChip status={w.status} />
            </div>
          )}
          columns={[
            {
              label: "",
              render: (w) => (
                <input type="checkbox" className="h-5 w-5" checked={selected.has(w.id)} onChange={() => toggle(w.id)} aria-label={`Select ${w.name}`} />
              ),
            },
            {
              label: "Person",
              render: (w) => (
                <div>
                  <p className="font-semibold">{w.name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{w.email}{w.phone ? ` · ${w.phone}` : ""}</p>
                </div>
              ),
            },
            { label: "Event", render: (w) => <span className="text-sm">{w.eventName}</span> },
            { label: "Joined", render: (w) => <span className="whitespace-nowrap text-sm">{format(new Date(w.createdAt), "d MMM, h:mma")}</span> },
            { label: "Status", render: (w) => <StatusChip status={w.status} /> },
            {
              label: "Notified",
              render: (w) => (w.notifiedAt ? format(new Date(w.notifiedAt), "d MMM, h:mma") : "—"),
            },
          ]}
        />
      )}

      {/* Notify modal */}
      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)} title="Tell the waitlist" width={420}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            {waitingCount} {waitingCount === 1 ? "person is" : "people are"} waiting. Email the first few in line — first come, first served.
          </p>
          <label className="a-label" htmlFor="notify-count">How many?</label>
          <input id="notify-count" className="a-input" type="number" min="1" max={waitingCount} value={notifyCount} onChange={(e) => setNotifyCount(e.target.value)} />
          <div className="flex gap-2">
            <button className="a-btn a-btn-orange flex-1" disabled={busy} onClick={() => notify(Number(notifyCount) || undefined)}>
              {busy ? "Sending…" : `Notify ${notifyCount || "all"}`}
            </button>
            <button className="a-btn a-btn-ghost" disabled={busy} onClick={() => notify()}>Notify all</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
