"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export type ActivityRow = {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  entityLabel: string;
  detail: Record<string, unknown>;
  createdAt: string;
};

const ACTION_LABELS: Record<string, string> = {
  "event.published": "published an event",
  "event.unpublished": "unpublished an event",
  "event.created": "created an event",
  "event.updated": "edited an event",
  "event.duplicated": "duplicated an event",
  "event.archived": "archived an event",
  "event.deleted": "deleted an event",
  "order.refunded": "issued a refund",
  "order.cancelled": "cancelled an order",
  "order.manual-sale": "added a manual sale",
  "coupon.created": "created a coupon",
  "coupon.updated": "edited a coupon",
  "coupon.deleted": "deleted a coupon",
  "enquiry.new": "opened an enquiry",
  "enquiry.contacted": "marked an enquiry contacted",
  "enquiry.quote_sent": "sent a quote",
  "enquiry.confirmed": "confirmed an enquiry",
  "enquiry.done": "finished an enquiry",
  "enquiry.lost": "marked an enquiry lost",
  "enquiry.spam": "marked spam",
  "waitlist.notified": "notified a waitlist",
  "experience.created": "added an experience",
  "experience.updated": "edited an experience",
  "experience.deleted": "deleted an experience",
  "faq.created": "added an FAQ",
  "faq.updated": "edited an FAQ",
  "faq.deleted": "deleted an FAQ",
  "client.created": "added a client",
  "client.updated": "edited a client",
  "client.deleted": "deleted a client",
  "media.added": "uploaded media",
  "media.deleted": "deleted media",
  "page.saved": "edited a policy page",
  "settings.updated": "edited site settings",
  "team.invited": "invited a teammate",
  "team.updated": "changed a teammate",
  "team.deactivated": "removed someone's access",
  "team.reactivated": "re-invited a teammate",
  "review.created": "added a review",
  "review.approved": "approved a review",
  "review.hidden": "hid a review",
  "review.deleted": "deleted a review",
  "content.seeded": "loaded starter content",
};

export function ActivityClient({
  initial,
  page,
  pages,
  total,
}: {
  initial: ActivityRow[];
  page: number;
  pages: number;
  total: number;
}) {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [curPage, setCurPage] = useState(page);
  const [curPages, setCurPages] = useState(pages);
  const [loading, setLoading] = useState(false);

  const load = async (query: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/activity?q=${encodeURIComponent(query)}&page=${p}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.data.items);
        setCurPage(data.data.page);
        setCurPages(data.data.pages);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3">
        <input
          className="a-input max-w-xs"
          placeholder="Search — a name, an action, a thing…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            void load(e.target.value, 1);
          }}
        />
        <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{total} entries</span>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="activity" title="Nothing yet" body="When the team does things — publishes, refunds, edits — it lands here." />
      ) : (
        <>
          <div className="a-card divide-y" style={loading ? { opacity: 0.6 } : {}}>
            {items.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: "var(--mint)", color: "var(--green)" }}
                >
                  {a.actorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.actorName}</span>{" "}
                    {ACTION_LABELS[a.action] ?? a.action.replace(/[._]/g, " ")}
                    {a.entityLabel ? <span style={{ color: "var(--admin-ink-soft)" }}> — {a.entityLabel}</span> : null}
                  </p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                    {new Date(a.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    {a.entityType ? ` · ${a.entityType}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {curPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" disabled={curPage <= 1} onClick={() => void load(q, curPage - 1)} className="a-btn a-btn-ghost a-btn-sm">
                ← Newer
              </button>
              <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                {curPage} / {curPages}
              </span>
              <button type="button" disabled={curPage >= curPages} onClick={() => void load(q, curPage + 1)} className="a-btn a-btn-ghost a-btn-sm">
                Older →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
