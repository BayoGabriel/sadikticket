"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable, Pagination } from "@/components/admin/ui/AdminTable";
import { Modal, ConfirmDialog } from "@/components/admin/ui/Modal";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";

type Sub = { id: string; email: string; city: string; source: string; status: string; createdAt: string };

export function SubscribersClient({
  initial,
  cities,
  events,
  query,
}: {
  initial: { items: Sub[]; total: number; page: number; pages: number };
  cities: { city: string; count: number }[];
  events: { id: string; name: string; city?: string }[];
  query: { q: string; city: string; source: string; status: string; page: number };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [q, setQ] = useState(query.q);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [blastOpen, setBlastOpen] = useState(false);
  const [blast, setBlast] = useState({ eventId: "", city: "", subject: "", intro: "" });
  const [confirmDel, setConfirmDel] = useState(false);
  const [busy, setBusy] = useState(false);

  function setParam(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    router.push(`/admin/subscribers?${next.toString()}`);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function doImport() {
    const rows = importText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [email, city] = l.split(/[,\t]/).map((x) => x?.trim());
        return { email: email ?? "", city };
      });
    if (!rows.length) { toast("Paste at least one email.", { error: true }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", rows }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast(`Added ${d.data.added} new ${d.data.added === 1 ? "subscriber" : "subscribers"}.`);
      setImportOpen(false); setImportText("");
      router.refresh();
    } catch (e) { toast((e as Error).message, { error: true }); } finally { setBusy(false); }
  }

  async function doBroadcast() {
    if (!blast.eventId) { toast("Pick an event.", { error: true }); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcast", eventId: blast.eventId, city: blast.city || undefined, subject: blast.subject || undefined, intro: blast.intro || undefined }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast(`Sent to ${d.data.sent} ${d.data.sent === 1 ? "subscriber" : "subscribers"}.`);
      setBlastOpen(false);
    } catch (e) { toast((e as Error).message, { error: true }); } finally { setBusy(false); }
  }

  async function doRemove() {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", ids: [...selected] }),
      });
      if ((await res.json()).success) {
        toast(`Removed ${selected.size}.`);
        setSelected(new Set());
        setConfirmDel(false);
        router.refresh();
      }
    } finally { setBusy(false); }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <form className="flex min-w-0 flex-1 gap-2 sm:flex-none" onSubmit={(e) => { e.preventDefault(); setParam({ q }); }}>
          <input className="a-input sm:w-72" placeholder="Search emails…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search subscribers" />
        </form>
        <select className="a-select" style={{ width: "auto" }} value={query.city} onChange={(e) => setParam({ city: e.target.value })} aria-label="Filter by city">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c.city} value={c.city}>{c.city} ({c.count})</option>)}
        </select>
        <select className="a-select" style={{ width: "auto" }} value={query.source} onChange={(e) => setParam({ source: e.target.value })} aria-label="Filter by source">
          <option value="">Any source</option>
          <option value="footer">Footer</option>
          <option value="empty-state">City notify</option>
          <option value="waitlist">Waitlist</option>
          <option value="manual">Manual</option>
        </select>
        <select className="a-select" style={{ width: "auto" }} value={query.status} onChange={(e) => setParam({ status: e.target.value })} aria-label="Filter by status">
          <option value="">Active + unsubscribed</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <div className="ml-auto flex gap-2">
          <a href={`/api/v1/admin/subscribers?format=csv&${sp.toString()}`} className="a-btn a-btn-ghost a-btn-sm"><Icon name="download" size={14} /> CSV</a>
          <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => setImportOpen(true)}><Icon name="upload" size={14} /> Import</button>
          <button className="a-btn a-btn-orange a-btn-sm" onClick={() => setBlastOpen(true)}><Icon name="send" size={14} /> Email subscribers</button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="a-card mb-3 flex items-center gap-3 px-4 py-2" style={{ background: "var(--mint)" }}>
          <p className="text-sm font-bold">{selected.size} selected</p>
          <button className="a-btn a-btn-ghost a-btn-sm ml-auto" style={{ color: "var(--admin-red)" }} onClick={() => setConfirmDel(true)}>Remove</button>
        </div>
      )}

      {initial.items.length === 0 ? (
        <EmptyState icon="users" title="No subscribers yet." body="People who join from the site footer or city pages land here. You can also import a list." actionLabel="Import emails" onAction={() => setImportOpen(true)} />
      ) : (
        <AdminTable
          rows={initial.items}
          rowKey={(s) => s.id}
          renderCard={(s) => (
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="h-5 w-5" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${s.email}`} />
                <div>
                  <p className="font-bold">{s.email}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{s.city || "—"} · {s.source} · {format(new Date(s.createdAt), "d MMM yyyy")}</p>
                </div>
              </label>
              <StatusChip status={s.status} />
            </div>
          )}
          columns={[
            { label: "", render: (s) => <input type="checkbox" className="h-5 w-5" checked={selected.has(s.id)} onChange={() => toggle(s.id)} aria-label={`Select ${s.email}`} /> },
            { label: "Email", render: (s) => <span className="font-semibold">{s.email}</span> },
            { label: "City", render: (s) => s.city || "—" },
            { label: "Source", render: (s) => <span className="text-sm">{s.source}</span> },
            { label: "Joined", render: (s) => format(new Date(s.createdAt), "d MMM yyyy") },
            { label: "Status", render: (s) => <StatusChip status={s.status} /> },
          ]}
        />
      )}
      <Pagination page={initial.page} pages={initial.pages} onPage={(p) => setParam({ page: String(p) })} />

      {/* Import */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import subscribers" width={460}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
            Paste one email per line — or <code>email, city</code>. Duplicates are skipped.
          </p>
          <textarea className="a-textarea" rows={8} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={"ada@example.com, Lagos\nsegun@example.com, Benin City"} />
          <button className="a-btn a-btn-orange w-full" disabled={busy} onClick={doImport}>{busy ? "Importing…" : "Import"}</button>
        </div>
      </Modal>

      {/* Broadcast */}
      <Modal open={blastOpen} onClose={() => setBlastOpen(false)} title="Email subscribers about an event" width={500}>
        <div className="space-y-4">
          <Field label="Event" required>
            <select className="a-select" value={blast.eventId} onChange={(e) => setBlast((s) => ({ ...s, eventId: e.target.value }))}>
              <option value="">Pick an event…</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}{e.city ? ` · ${e.city}` : ""}</option>)}
            </select>
          </Field>
          <Field label="Send to" hint="Everyone subscribed, or just one city.">
            <select className="a-select" value={blast.city} onChange={(e) => setBlast((s) => ({ ...s, city: e.target.value }))}>
              <option value="">Everyone subscribed</option>
              {cities.filter((c) => c.city !== "—").map((c) => <option key={c.city} value={c.city}>{c.city} ({c.count})</option>)}
            </select>
          </Field>
          <Field label="Subject" hint="Optional — defaults to 'Event name — tickets are live'.">
            <input className="a-input" value={blast.subject} onChange={(e) => setBlast((s) => ({ ...s, subject: e.target.value }))} />
          </Field>
          <Field label="Opening line" hint="Optional — a sentence at the top.">
            <input className="a-input" value={blast.intro} onChange={(e) => setBlast((s) => ({ ...s, intro: e.target.value }))} placeholder="Something new on the calendar." />
          </Field>
          <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>Every email includes an unsubscribe link. Unsubscribed people never get these.</p>
          <button className="a-btn a-btn-orange w-full" disabled={busy} onClick={doBroadcast}>{busy ? "Sending…" : "Send"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={doRemove}
        title="Remove subscribers?"
        body={`Delete ${selected.size} ${selected.size === 1 ? "person" : "people"} from the list? They can always subscribe again.`}
        confirmLabel="Remove"
        loading={busy}
      />
    </div>
  );
}
