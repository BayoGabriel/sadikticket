"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import type { AdminEventRow } from "@/services/adminEventService";
import { formatNaira } from "@/lib/format";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Icon } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminTable, Pagination } from "@/components/admin/ui/AdminTable";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { useToast } from "@/components/admin/ui/Toast";

type Query = {
  tab: string;
  city: string;
  type: string;
  tag: string;
  month: string;
  status: string;
  search: string;
  sort: string;
  order: string;
  page: number;
};

type Data = { items: AdminEventRow[]; total: number; page: number; pages: number };

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "drafts", label: "Drafts" },
  { key: "all", label: "All" },
];

function RowMenu({ e, onAction }: { e: AdminEventRow; onAction: (action: string, e: AdminEventRow) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onClick={(ev) => ev.stopPropagation()}>
      <button
        type="button"
        className="a-btn a-btn-ghost a-btn-sm"
        style={{ padding: "0.4rem" }}
        aria-label={`Actions for ${e.name}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="kebab" size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="a-card absolute right-0 z-50 mt-1 w-52 p-1.5">
            {[
              { label: "Open overview", href: `/admin/events/${e.id}` },
              { label: "Edit", href: `/admin/events/${e.id}/edit` },
              { label: "View on site", href: `/events/${e.slug}`, external: true },
              { label: "Orders", href: `/admin/orders?event=${e.id}` },
              { label: "Check-in", href: `/admin/check-in?event=${e.id}` },
              { label: "Waitlist", href: `/admin/waitlist?event=${e.id}` },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[var(--mint)]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--mint)]" onClick={() => { setOpen(false); onAction("copy-link", e); }}>
              Copy public link
            </button>
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--mint)]" onClick={() => { setOpen(false); onAction("duplicate", e); }}>
              Duplicate
            </button>
            {e.status === "PUBLISHED" ? (
              <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--mint)]" onClick={() => { setOpen(false); onAction("unpublish", e); }}>
                Unpublish
              </button>
            ) : e.status === "DRAFT" ? (
              <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--mint)]" onClick={() => { setOpen(false); onAction("publish", e); }}>
                Publish
              </button>
            ) : null}
            <hr className="my-1" style={{ borderColor: "var(--admin-line)" }} />
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--mint)]" onClick={() => { setOpen(false); onAction("archive", e); }}>
              Archive
            </button>
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--admin-red-bg)]" style={{ color: "var(--admin-red)" }} onClick={() => { setOpen(false); onAction("delete", e); }}>
              Delete…
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function EventsClient({
  initial,
  cities,
  types,
  query,
}: {
  initial: Data;
  cities: string[];
  types: string[];
  query: Query;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState(query.search);
  const [confirm, setConfirm] = useState<{ action: "delete" | "archive" | "unpublish" | "publish"; event: AdminEventRow } | null>(null);
  const [busy, setBusy] = useState(false);

  function setParam(patch: Record<string, string>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    startTransition(() => router.push(`/admin/events?${next.toString()}`));
  }

  async function doAction(action: string, e: AdminEventRow) {
    if (action === "copy-link") {
      await navigator.clipboard.writeText(`${location.origin}/events/${e.slug}`);
      toast("Link copied — share away.");
      return;
    }
    if (action === "duplicate") {
      setBusy(true);
      const res = await fetch(`/api/v1/admin/events/${e.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      setBusy(false);
      if (data.success) {
        toast("Duplicated as a draft.", { actionLabel: "Edit it", onAction: () => router.push(`/admin/events/${data.data.id}/edit`) });
        router.refresh();
      } else toast(data.error || "Couldn't duplicate that event.", { error: true });
      return;
    }
    setConfirm({ action: action as "delete", event: e });
  }

  async function runConfirm() {
    if (!confirm) return;
    setBusy(true);
    const { action, event } = confirm;
    try {
      let res: Response;
      if (action === "delete") res = await fetch(`/api/v1/admin/events/${event.id}`, { method: "DELETE" });
      else if (action === "archive") res = await fetch(`/api/v1/admin/events/${event.id}/archive`, { method: "POST" });
      else res = await fetch(`/api/v1/admin/events/${event.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action === "publish" ? "PUBLISHED" : "DRAFT" }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast(
        action === "delete" ? "Deleted." : action === "archive" ? "Archived — it's off the site but records are kept." : action === "publish" ? "It's live!" : "Back to drafts.",
        action === "archive" || action === "unpublish"
          ? { actionLabel: "Undo", onAction: async () => { await fetch(`/api/v1/admin/events/${event.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PUBLISHED" }) }); router.refresh(); } }
          : undefined,
      );
      setConfirm(null);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
    }
  }

  async function bulk(action: "publish" | "unpublish" | "archive") {
    if (!selected.size) return;
    setBusy(true);
    const res = await fetch("/api/v1/admin/events/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.success) {
      toast(`${data.data.done} event${data.data.done === 1 ? "" : "s"} ${action === "archive" ? "archived" : action === "publish" ? "published" : "unpublished"}${data.data.failed ? `, ${data.data.failed} couldn't be` : ""}.`);
      setSelected(new Set());
      router.refresh();
    } else toast(data.error || "Bulk action failed.", { error: true });
  }

  const toggleAll = () =>
    setSelected(selected.size === initial.items.length ? new Set() : new Set(initial.items.map((e) => e.id)));

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="a-card flex p-0.5" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={query.tab === t.key}
              className="min-h-[36px] rounded-full px-3.5 text-sm font-bold"
              style={{ background: query.tab === t.key ? "var(--green)" : "transparent", color: query.tab === t.key ? "var(--cream)" : "var(--admin-ink-soft)" }}
              onClick={() => setParam({ tab: t.key, status: "" })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="a-btn a-btn-ghost a-btn-sm"
            onClick={() => setView(view === "table" ? "cards" : "table")}
            aria-label="Toggle view"
          >
            <Icon name={view === "table" ? "dashboard" : "menu"} size={15} />
            <span className="hidden sm:inline">{view === "table" ? "Cards" : "Table"}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <form
          className="flex min-w-0 flex-1 gap-2 sm:flex-none"
          onSubmit={(e) => { e.preventDefault(); setParam({ search }); }}
        >
          <input className="a-input sm:w-64" placeholder="Search name, venue…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search events" />
        </form>
        <select className="a-select" style={{ width: "auto" }} value={query.city} onChange={(e) => setParam({ city: e.target.value })} aria-label="Filter by city">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="a-select" style={{ width: "auto" }} value={query.type} onChange={(e) => setParam({ type: e.target.value })} aria-label="Filter by type">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="a-select" style={{ width: "auto" }} value={query.tag} onChange={(e) => setParam({ tag: e.target.value })} aria-label="Filter by tag">
          <option value="">All tags</option>
          {["evening", "outdoor", "beginner-friendly", "good for groups"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="month" className="a-input" style={{ width: "auto" }} value={query.month} onChange={(e) => setParam({ month: e.target.value })} aria-label="Filter by month" />
        {query.tab === "all" && (
          <select className="a-select" style={{ width: "auto" }} value={query.status} onChange={(e) => setParam({ status: e.target.value })} aria-label="Filter by status">
            <option value="">All statuses</option>
            {["PUBLISHED", "DRAFT", "CANCELLED", "COMPLETED"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="a-card mb-3 flex flex-wrap items-center gap-2 px-4 py-2.5" style={{ background: "var(--mint)" }}>
          <span className="text-sm font-bold">{selected.size} selected</span>
          <button type="button" className="a-btn a-btn-green a-btn-sm" disabled={busy} onClick={() => bulk("publish")}>Publish</button>
          <button type="button" className="a-btn a-btn-outline a-btn-sm" disabled={busy} onClick={() => bulk("unpublish")}>Unpublish</button>
          <button type="button" className="a-btn a-btn-outline a-btn-sm" disabled={busy} onClick={() => bulk("archive")}>Archive</button>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm ml-auto" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {initial.items.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No events here yet."
          body="Let's put something fun on the calendar — a paint night, a karaoke evening, a picnic…"
          actionLabel="New event"
          actionHref="/admin/events/new"
        />
      ) : view === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {initial.items.map((e) => (
            <div key={e.id} className="a-card overflow-hidden">
              <div className="h-32 w-full" style={{ background: "var(--mint)" }}>
                {e.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.coverImage} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <Link href={`/admin/events/${e.id}`} className="font-bold hover:underline">{e.name}</Link>
                  <RowMenu e={e} onAction={doAction} />
                </div>
                <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  {format(new Date(e.startsAt), "EEE d MMM, h:mma")} · {e.city}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <StatusChip status={e.statusTag === "draft" ? "DRAFT" : e.statusTag} />
                  <span className="text-xs font-semibold">{e.sold}/{e.capacity} · {formatNaira(e.revenue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminTable
          rows={initial.items}
          rowKey={(e) => e.id}
          renderCard={(e) => (
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link href={`/admin/events/${e.id}`} className="font-bold hover:underline">{e.name}</Link>
                <RowMenu e={e} onAction={doAction} />
              </div>
              <p className="mt-0.5 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                {format(new Date(e.startsAt), "EEE d MMM, h:mma")} · {e.city} · {e.venueName}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="a-progress flex-1"><span style={{ width: `${e.capacity ? Math.min(100, (e.sold / e.capacity) * 100) : 0}%` }} /></div>
                <span className="text-xs font-semibold">{e.sold}/{e.capacity}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusChip status={e.statusTag === "draft" ? "DRAFT" : e.statusTag} />
                <span className="text-xs font-semibold">{formatNaira(e.revenue)}</span>
              </div>
            </div>
          )}
          columns={[
            {
              label: (
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selected.size === initial.items.length && initial.items.length > 0}
                  onChange={toggleAll}
                />
              ) as unknown as string,
              render: (e) => (
                <input
                  type="checkbox"
                  aria-label={`Select ${e.name}`}
                  checked={selected.has(e.id)}
                  onChange={() =>
                    setSelected((s) => {
                      const n = new Set(s);
                      if (n.has(e.id)) n.delete(e.id); else n.add(e.id);
                      return n;
                    })
                  }
                  onClick={(ev) => ev.stopPropagation()}
                />
              ),
              className: "w-8",
            },
            {
              label: "Event",
              render: (e) => (
                <div className="flex items-center gap-3">
                  <div className="h-11 w-16 flex-none overflow-hidden rounded-lg" style={{ background: "var(--mint)" }}>
                    {e.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.coverImage} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <Link href={`/admin/events/${e.id}`} className="font-bold hover:underline">{e.name}</Link>
                    <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>/{e.slug}</p>
                  </div>
                </div>
              ),
            },
            {
              label: "When",
              render: (e) => (
                <span className="whitespace-nowrap text-sm">
                  {format(new Date(e.startsAt), "EEE d MMM yy")}<br />
                  <span style={{ color: "var(--admin-ink-soft)" }}>{format(new Date(e.startsAt), "h:mma")}</span>
                </span>
              ),
            },
            { label: "City", render: (e) => <span className="text-sm">{e.city || "—"}</span> },
            {
              label: "Sold",
              render: (e) => (
                <div className="w-24">
                  <div className="a-progress"><span style={{ width: `${e.capacity ? Math.min(100, (e.sold / e.capacity) * 100) : 0}%` }} /></div>
                  <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{e.sold}/{e.capacity}</span>
                </div>
              ),
            },
            { label: "Revenue", render: (e) => <span className="text-sm font-semibold">{formatNaira(e.revenue)}</span> },
            { label: "Status", render: (e) => <StatusChip status={e.statusTag === "draft" ? "DRAFT" : e.statusTag} /> },
            { label: "", render: (e) => <RowMenu e={e} onAction={doAction} />, className: "text-right" },
          ]}
        />
      )}

      <Pagination page={initial.page} pages={initial.pages} onPage={(p) => setParam({ page: String(p) })} />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        loading={busy}
        title={
          confirm?.action === "delete" ? `Delete “${confirm.event.name}”?`
          : confirm?.action === "archive" ? `Archive “${confirm.event.name}”?`
          : confirm?.action === "publish" ? `Publish “${confirm?.event.name}”?`
          : `Unpublish “${confirm?.event.name}”?`
        }
        body={
          confirm?.action === "delete" ? (
            <>This removes the event and its ticket types for good. If it has paid orders you&apos;ll need to archive it instead — you&apos;ll be told if so.</>
          ) : confirm?.action === "archive" ? (
            <>It disappears from the site and lists, but all orders and records stay safe. You can bring it back as a draft anytime.</>
          ) : confirm?.action === "publish" ? (
            <>It goes live on the site right away — homepage, events page and its own page.</>
          ) : (
            <>It comes off the site and goes back to drafts. Tickets already sold stay valid.</>
          )
        }
        confirmLabel={confirm?.action === "delete" ? "Delete" : confirm?.action === "archive" ? "Archive" : confirm?.action === "publish" ? "Publish" : "Unpublish"}
        requireText={confirm?.action === "delete" ? confirm.event.name : undefined}
      />
    </div>
  );
}
