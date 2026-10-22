"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { NAV_GROUPS, MOBILE_TABS, type NavItem } from "@/lib/admin-nav";
import { can } from "@/lib/auth";
import type { UserRole } from "@/models/user";
import { Icon } from "./ui/icons";
import { ToastProvider, useToast } from "./ui/Toast";
import { Modal } from "./ui/Modal";

export type ShellBadges = { enquiries: number; orders: number; waitlist: number };
export type ShellUser = { name: string; email: string; role: UserRole };

// ── Sidebar ──────────────────────────────────────────────────────────────────
function NavLink({
  item,
  active,
  badge,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link href={item.href} className={`a-nav-link ${active ? "active" : ""}`} onClick={onClick}>
      <Icon name={item.icon} size={17} />
      <span>{item.label}</span>
      {badge ? <span className="a-badge">{badge > 99 ? "99+" : badge}</span> : null}
    </Link>
  );
}

function Sidebar({
  user,
  badges,
  onNavigate,
}: {
  user: ShellUser;
  badges: ShellBadges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="a-sidebar flex h-full flex-col overflow-y-auto px-3 py-5" aria-label="Admin">
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-2" onClick={onNavigate}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/artlogo.png" alt="SerenArt" width={110} height={30} style={{ filter: "brightness(0) invert(1) brightness(1.15)" }} />
      </Link>
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((i) => can(user.role, i.permission));
        if (!items.length) return null;
        return (
          <div key={group.label} className="mb-4">
            <p className="a-nav-group">{group.label}</p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)}
                  badge={item.badgeKey ? badges[item.badgeKey] : undefined}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </div>
        );
      })}
      <div className="mt-auto px-2 pt-4 text-xs" style={{ color: "rgba(255,254,221,0.45)" }}>
        <p className="font-bold" style={{ color: "rgba(255,254,221,0.7)" }}>{user.name}</p>
        <p>{user.email}</p>
      </div>
    </nav>
  );
}

// ── Command palette ──────────────────────────────────────────────────────────
type SearchHit = { type: string; id: string; title: string; subtitle?: string; href: string };

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setHits([]);
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/admin/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setHits(data.results ?? []);
        setSel(0);
      } finally {
        setLoading(false);
      }
    }, 220);
  }, [q]);

  const actions: SearchHit[] = useMemo(
    () => [
      { type: "action", id: "new-event", title: "New event", subtitle: "Quick action", href: "/admin/events/new" },
      { type: "action", id: "check-in", title: "Check in guests", subtitle: "Quick action", href: "/admin/check-in" },
      { type: "action", id: "manual-sale", title: "Add manual sale", subtitle: "Quick action", href: "/admin/orders?new=manual" },
      { type: "action", id: "new-coupon", title: "New coupon", subtitle: "Quick action", href: "/admin/coupons?new=1" },
    ],
    [],
  );

  const list = q.trim() ? hits : actions;

  function go(hit: SearchHit) {
    onClose();
    router.push(hit.href);
  }

  if (!open) return null;
  return (
    <div className="a-drawer-backdrop" style={{ zIndex: 95, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="a-card w-[calc(100vw-2rem)] overflow-hidden"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-4" style={{ borderColor: "var(--admin-line)" }}>
          <Icon name="search" size={17} />
          <input
            ref={inputRef}
            className="w-full bg-transparent py-3.5 text-base outline-none"
            placeholder="Search events, orders, people…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter" && list[sel]) go(list[sel]);
            }}
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
          />
          <kbd className="rounded border px-1.5 py-0.5 text-xs" style={{ borderColor: "var(--admin-line)", color: "var(--admin-ink-soft)" }}>esc</kbd>
        </div>
        <div id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {loading && <p className="px-3 py-2 text-sm" style={{ color: "var(--admin-ink-soft)" }}>Searching…</p>}
          {!loading && q.trim() && !hits.length && (
            <p className="px-3 py-2 text-sm" style={{ color: "var(--admin-ink-soft)" }}>Nothing found for “{q}”.</p>
          )}
          {list.map((hit, i) => (
            <button
              key={`${hit.type}-${hit.id}`}
              role="option"
              aria-selected={i === sel}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left"
              style={{ background: i === sel ? "var(--mint)" : "transparent" }}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(hit)}
            >
              <span
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg"
                style={{ background: "var(--peach-2)", color: "var(--orange)" }}
              >
                <Icon name={hit.type === "action" ? "sparkles" : hit.type === "event" ? "calendar" : hit.type === "order" ? "ticket" : hit.type === "enquiry" ? "inbox" : "users"} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{hit.title}</span>
                {hit.subtitle && (
                  <span className="block truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>{hit.subtitle}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────
type Notice = { id: string; text: string; href: string; level: "info" | "warn" };

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[] | null>(null);

  useEffect(() => {
    if (!open || items) return;
    fetch("/api/v1/admin/notifications")
      .then((r) => r.json())
      .then((d) => setItems(d.notifications ?? []))
      .catch(() => setItems([]));
  }, [open, items]);

  return (
    <div className="relative">
      <button
        type="button"
        className="a-btn a-btn-ghost a-btn-sm"
        style={{ padding: "0.45rem" }}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="a-card absolute right-0 z-50 mt-1 w-80 p-2" role="menu">
            {items === null && <p className="px-3 py-2 text-sm" style={{ color: "var(--admin-ink-soft)" }}>Loading…</p>}
            {items?.length === 0 && (
              <p className="px-3 py-3 text-sm" style={{ color: "var(--admin-ink-soft)" }}>All quiet. Nothing needs you right now.</p>
            )}
            {items?.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--mint)]"
                onClick={() => setOpen(false)}
              >
                <span className="mt-1 h-2 w-2 flex-none rounded-full" style={{ background: n.level === "warn" ? "var(--orange)" : "var(--mint-2)" }} />
                {n.text}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Shell ────────────────────────────────────────────────────────────────────
function ShellInner({ user, badges, children }: { user: ShellUser; badges: ShellBadges; children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const gPending = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const { toast } = useToast();

  // Keyboard shortcuts: Cmd/Ctrl+K or / → search · g e → events · n → new event · ? → help
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); setPaletteOpen(true); }
      if (e.key === "?") { setHelpOpen(true); }
      if (e.key.toLowerCase() === "n") { router.push("/admin/events/new"); }
      if (e.key.toLowerCase() === "g") {
        gPending.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => (gPending.current = false), 800);
        return;
      }
      if (gPending.current) {
        gPending.current = false;
        const k = e.key.toLowerCase();
        if (k === "e") router.push("/admin/events");
        if (k === "o") router.push("/admin/orders");
        if (k === "c") router.push("/admin/check-in");
        if (k === "q") router.push("/admin/enquiries");
        if (k === "d") router.push("/admin");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    toast("Signed out. See you soon!");
    router.push("/admin/login");
    router.refresh();
  }

  const mobileTabs = MOBILE_TABS.filter((t) => can(user.role, t.permission));

  return (
    <div className="admin-canvas flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-none lg:block">
        <Sidebar user={user} badges={badges} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="a-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="a-drawer" style={{ left: 0, right: "auto", width: "min(280px, 85vw)", boxShadow: "12px 0 40px rgba(0,0,0,0.2)", animationName: "a-drawer-in-left" }}>
            <style>{`@keyframes a-drawer-in-left { from { transform: translateX(-40px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
            <Sidebar user={user} badges={badges} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-2.5 sm:px-6" style={{ background: "var(--admin-canvas)", borderColor: "var(--admin-line)" }}>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm lg:hidden" style={{ padding: "0.45rem" }} aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <Icon name="menu" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="a-card flex min-h-[38px] flex-1 items-center gap-2 px-3.5 text-sm sm:max-w-xs"
            style={{ color: "var(--admin-ink-soft)" }}
            aria-label="Open search"
          >
            <Icon name="search" size={15} />
            <span className="hidden sm:inline">Search anything…</span>
            <span className="sm:hidden">Search…</span>
            <kbd className="ml-auto hidden rounded border px-1.5 py-0.5 text-[0.65rem] sm:block" style={{ borderColor: "var(--admin-line)" }}>⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationsBell />
            <Link href="/" target="_blank" className="a-btn a-btn-ghost a-btn-sm hidden sm:inline-flex">
              <Icon name="external" size={15} /> View site
            </Link>
            <div className="relative">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold"
                style={{ background: "var(--green)", color: "var(--cream)" }}
                aria-label="Your account"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="a-card absolute right-0 z-50 mt-1 w-52 p-2">
                    <p className="px-3 py-1.5 text-xs" style={{ color: "var(--admin-ink-soft)" }}>{user.email}</p>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[var(--mint)]"
                      onClick={logout}
                    >
                      <Icon name="logout" size={15} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 lg:pb-8">{children}</main>

        {/* Mobile bottom tabs */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t py-1.5 lg:hidden"
          style={{ background: "var(--green)" }}
          aria-label="Quick navigation"
        >
          {mobileTabs.map((t) => {
            const active = t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className="flex min-h-[44px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg text-[0.65rem] font-bold"
                style={{ color: active ? "var(--orange)" : "rgba(255,254,221,0.65)" }}
              >
                <Icon name={t.icon} size={19} />
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard shortcuts">
        <ul className="space-y-2 text-sm">
          {[
            ["⌘/Ctrl + K or /", "Search anything"],
            ["G then E", "Go to Events"],
            ["G then O", "Go to Orders"],
            ["G then C", "Go to Check-in"],
            ["G then Q", "Go to Enquiries"],
            ["G then D", "Go to Dashboard"],
            ["N", "New event"],
            ["?", "This help"],
          ].map(([keys, what]) => (
            <li key={keys} className="flex items-center justify-between">
              <span style={{ color: "var(--admin-ink-soft)" }}>{what}</span>
              <kbd className="rounded border px-1.5 py-0.5 text-xs font-bold" style={{ borderColor: "var(--admin-line)" }}>{keys}</kbd>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export function AdminShell(props: { user: ShellUser; badges: ShellBadges; children: ReactNode }) {
  return (
    <ToastProvider>
      <ShellInner {...props} />
    </ToastProvider>
  );
}
