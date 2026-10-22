"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable } from "@/components/admin/ui/AdminTable";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field } from "@/components/admin/ui/Field";
import { useToast } from "@/components/admin/ui/Toast";

export type EnquiryRow = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  occasion: string;
  experience: string;
  service: string;
  date: string;
  guests: string;
  location: string;
  frequency: string;
  message: string;
  stage: string;
  read: boolean;
  ownerId: string;
  ownerName: string;
  followUpAt: string | null;
  quoteAmount: number | null;
  booking: { date?: string; venue?: string; price?: number } | null;
  notes: { text: string; author: string; createdAt: string }[];
  createdAt: string;
  ageHours: number;
};

const STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "quote_sent", label: "Quote sent" },
  { key: "confirmed", label: "Confirmed" },
  { key: "done", label: "Done" },
  { key: "lost", label: "Lost" },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "private", label: "Private" },
  { key: "business", label: "Business" },
  { key: "general", label: "General" },
];

function summary(e: EnquiryRow) {
  if (e.kind === "business") return [e.service || "Team day", e.guests && `${e.guests} people`, e.frequency, e.location].filter(Boolean).join(" · ");
  if (e.kind === "general") return e.message.slice(0, 60);
  return [e.occasion || e.experience || "Private event", e.date, e.guests && `${e.guests} guests`, e.location].filter(Boolean).join(" · ");
}

function whatsappLink(e: EnquiryRow) {
  const phone = (e.phone || "").replace(/\D/g, "").replace(/^0/, "234");
  const text = encodeURIComponent(
    `Hi ${e.name?.split(" ")[0] || "there"}! This is SerenArt — thanks for reaching out${e.occasion ? ` about your ${e.occasion}` : e.service ? ` about ${e.service}` : ""}. I'd love to help you plan it. 🙂`,
  );
  return `https://wa.me/${phone}?text=${text}`;
}

export function EnquiriesClient({
  items,
  counts,
  team,
  query,
}: {
  items: EnquiryRow[];
  counts: Record<string, number>;
  team: { id: string; name: string }[];
  query: { tab: string; stage: string; q: string; owner: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [view, setView] = useState<"board" | "table">("board");
  const [open, setOpen] = useState<EnquiryRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState(query.q);
  const [dragId, setDragId] = useState<string | null>(null);

  function setParam(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    router.push(`/admin/enquiries?${next.toString()}`);
  }

  async function patch(id: string, body: Record<string, unknown>, refresh = true) {
    const res = await fetch(`/api/v1/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!d.success) { toast(d.error || "Couldn't save.", { error: true }); return false; }
    if (refresh) router.refresh();
    return true;
  }

  async function move(id: string, stage: string, label?: string) {
    const ok = await patch(id, { stage }, false);
    if (ok) {
      toast(label ?? `Moved to ${STAGES.find((s) => s.key === stage)?.label}.`);
      router.refresh();
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, EnquiryRow[]> = Object.fromEntries(STAGES.map((s) => [s.key, []]));
    for (const e of items) {
      if (e.stage === "spam") continue;
      (g[e.stage] ??= []).push(e);
    }
    return g;
  }, [items]);

  function openDrawer(e: EnquiryRow) {
    setOpen(e);
    setNote("");
    if (!e.read) patch(e.id, { read: true }, true);
  }

  return (
    <div>
      {/* Tabs + view toggle + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="a-card flex p-0.5" role="tablist">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={query.tab === t.key} className="min-h-[36px] rounded-full px-3.5 text-sm font-bold"
              style={{ background: query.tab === t.key ? "var(--green)" : "transparent", color: query.tab === t.key ? "var(--cream)" : "var(--admin-ink-soft)" }}
              onClick={() => setParam({ tab: t.key === "all" ? "" : t.key })}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="a-card flex p-0.5" aria-label="View">
          {(["board", "table"] as const).map((v) => (
            <button key={v} className="min-h-[36px] rounded-full px-3.5 text-sm font-bold" aria-pressed={view === v}
              style={{ background: view === v ? "var(--mint)" : "transparent" }}
              onClick={() => setView(v)}>
              {v === "board" ? "Board" : "Table"}
            </button>
          ))}
        </div>
        <form className="flex min-w-0 flex-1 gap-2 sm:flex-none" onSubmit={(e) => { e.preventDefault(); setParam({ q }); }}>
          <input className="a-input sm:w-64" placeholder="Name, email, company, occasion…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
        </form>
        <select className="a-select" style={{ width: "auto" }} value={query.stage} onChange={(e) => setParam({ stage: e.target.value })} aria-label="Filter by stage">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label} ({counts[s.key] ?? 0})</option>)}
          <option value="spam">Spam</option>
        </select>
        <select className="a-select" style={{ width: "auto" }} value={query.owner} onChange={(e) => setParam({ owner: e.target.value })} aria-label="Filter by owner">
          <option value="">Any owner</option>
          {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <a href={`/api/v1/admin/enquiries?format=csv&${sp.toString()}`} className="a-btn a-btn-ghost a-btn-sm ml-auto"><Icon name="download" size={14} /> CSV</a>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="inbox" title="All quiet." body="New enquiries from the site land here — private bookings, business days and contact messages." />
      ) : view === "board" ? (
        /* Kanban */
        <div className="flex gap-3 overflow-x-auto pb-4" role="list" aria-label="Enquiry board">
          {STAGES.map((s) => (
            <div
              key={s.key}
              className="a-card min-h-[200px] w-64 flex-none p-3"
              style={{ background: "var(--admin-canvas)" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragId) move(dragId, s.key); setDragId(null); }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-sm font-bold">{s.label}</p>
                <span className="a-chip a-chip-grey">{(grouped[s.key] ?? []).length}</span>
              </div>
              <div className="space-y-2">
                {(grouped[s.key] ?? []).map((e) => (
                  <button
                    key={e.id}
                    draggable
                    onDragStart={() => setDragId(e.id)}
                    onClick={() => openDrawer(e)}
                    className="a-card w-full p-3 text-left transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-tight">
                        {e.name || e.email.split("@")[0]}
                        {e.company ? <span className="font-normal" style={{ color: "var(--admin-ink-soft)" }}> · {e.company}</span> : null}
                      </p>
                      {!e.read && <span className="mt-1 h-2 w-2 flex-none rounded-full" style={{ background: "var(--orange)" }} aria-label="Unread" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{summary(e)}</p>
                    <div className="mt-2 flex items-center justify-between text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                      <span>{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</span>
                      {e.ownerName && <span className="a-chip a-chip-green">{e.ownerName.split(" ")[0]}</span>}
                    </div>
                    {e.followUpAt && <p className="mt-1 text-xs font-bold" style={{ color: "var(--admin-amber)" }}>Follow up {format(new Date(e.followUpAt), "d MMM")}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminTable
          rows={items}
          rowKey={(e) => e.id}
          onRowClick={openDrawer}
          renderCard={(e) => (
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{e.name || e.email}{e.company ? ` · ${e.company}` : ""}</p>
                <StatusChip status={e.stage} />
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{summary(e)}</p>
            </div>
          )}
          columns={[
            { label: "", render: (e) => (!e.read ? <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--orange)" }} /> : null) },
            { label: "Who", render: (e) => <div><p className="font-semibold">{e.name || "—"}{e.company ? ` · ${e.company}` : ""}</p><p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{e.kind === "business" ? "Business" : e.kind === "general" ? "General" : "Private"}</p></div> },
            { label: "What", render: (e) => <span className="text-sm">{summary(e)}</span> },
            { label: "Stage", render: (e) => <StatusChip status={e.stage} /> },
            { label: "Owner", render: (e) => e.ownerName || "—" },
            { label: "Age", render: (e) => <span className="text-xs whitespace-nowrap" style={{ color: e.ageHours > 24 && e.stage === "new" ? "var(--admin-red)" : "var(--admin-ink-soft)" }}>{formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}</span> },
          ]}
        />
      )}

      {/* Detail drawer */}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `${open.name || open.email}${open.company ? ` · ${open.company}` : ""}` : ""}>
        {open && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={open.stage} />
              <span className="a-chip a-chip-outline">{open.kind === "business" ? "Business" : open.kind === "general" ? "General" : "Private booking"}</span>
              <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{formatDistanceToNow(new Date(open.createdAt), { addSuffix: true })}</span>
            </div>

            {/* Submitted fields */}
            <dl className="a-card space-y-2 p-4 text-sm" style={{ background: "var(--admin-canvas)" }}>
              {[
                ["Email", open.email],
                ["Phone", open.phone],
                ["Occasion", open.occasion],
                ["Experience", open.experience],
                ["Service", open.service],
                ["Date", open.date],
                ["Guests", open.guests],
                ["Frequency", open.frequency],
                ["Location", open.location],
                ["Notes", open.message],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="w-24 flex-none font-semibold" style={{ color: "var(--admin-ink-soft)" }}>{k}</dt>
                  <dd className="min-w-0">{v}</dd>
                </div>
              ))}
            </dl>

            {/* Contact actions */}
            <div className="flex flex-wrap gap-2">
              {open.phone && (
                <>
                  <a href={whatsappLink(open)} target="_blank" rel="noreferrer" className="a-btn a-btn-green"><Icon name="whatsapp" size={16} /> WhatsApp</a>
                  <a href={`tel:${open.phone}`} className="a-btn a-btn-ghost"><Icon name="phone" size={14} /> Call</a>
                </>
              )}
              <a href={`mailto:${open.email}`} className="a-btn a-btn-ghost"><Icon name="mail" size={14} /> Email</a>
            </div>

            {/* Stage + owner + follow-up */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Stage">
                <select className="a-select" value={open.stage} onChange={(e) => { move(open.id, e.target.value); setOpen({ ...open, stage: e.target.value }); }}>
                  {[...STAGES, { key: "spam", label: "Spam" }].map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Owner">
                <select className="a-select" value={open.ownerId} onChange={(e) => { patch(open.id, { ownerId: e.target.value || null }); setOpen({ ...open, ownerId: e.target.value, ownerName: team.find((t) => t.id === e.target.value)?.name ?? "" }); }}>
                  <option value="">Unassigned</option>
                  {team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Follow up">
                <input type="date" className="a-input" value={open.followUpAt ? open.followUpAt.slice(0, 10) : ""} onChange={(e) => { patch(open.id, { followUpAt: e.target.value || null }); setOpen({ ...open, followUpAt: e.target.value ? `${e.target.value}T00:00:00` : null }); }} />
              </Field>
            </div>

            {/* Quote + booking */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Quote (₦)">
                <input type="number" min="0" className="a-input" defaultValue={open.quoteAmount ? open.quoteAmount / 100 : ""} onBlur={(e) => { const v = e.target.value ? Number(e.target.value) : null; if (v !== (open.quoteAmount ? open.quoteAmount / 100 : null)) patch(open.id, { quoteNaira: v }); }} />
              </Field>
              <Field label="Confirmed price (₦)" hint={open.stage === "confirmed" ? undefined : "Move to Confirmed first."}>
                <input type="number" min="0" className="a-input" defaultValue={open.booking?.price ? open.booking.price / 100 : ""} disabled={open.stage !== "confirmed"} onBlur={(e) => patch(open.id, { booking: { ...open.booking, priceNaira: e.target.value ? Number(e.target.value) : null } })} />
              </Field>
            </div>
            {open.stage === "confirmed" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Confirmed date"><input type="text" className="a-input" placeholder="e.g. Sat 12 July" defaultValue={open.booking?.date ?? ""} onBlur={(e) => patch(open.id, { booking: { ...open.booking, date: e.target.value } })} /></Field>
                <Field label="Venue"><input type="text" className="a-input" defaultValue={open.booking?.venue ?? ""} onBlur={(e) => patch(open.id, { booking: { ...open.booking, venue: e.target.value } })} /></Field>
              </div>
            )}

            {/* Notes */}
            <div>
              <p className="a-label">Notes & history</p>
              <ul className="space-y-2">
                {(open.notes ?? []).map((n, i) => (
                  <li key={i} className="a-card p-3 text-sm" style={{ background: "var(--admin-canvas)" }}>
                    {n.text}
                    <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{n.author} · {format(new Date(n.createdAt), "d MMM, h:mma")}</p>
                  </li>
                ))}
                {!open.notes?.length && <p className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>No notes yet.</p>}
              </ul>
              <form
                className="mt-2 flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  setBusy(true);
                  const ok = await patch(open.id, { note });
                  if (ok) { setNote(""); setOpen({ ...open, notes: [...(open.notes ?? []), { text: note, author: "You", createdAt: new Date().toISOString() }] }); }
                  setBusy(false);
                }}
              >
                <input className="a-input" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="a-btn a-btn-ghost" type="submit" disabled={busy}>Add</button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
