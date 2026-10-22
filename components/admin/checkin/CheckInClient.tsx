"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/components/admin/ui/Toast";
import { Icon } from "@/components/admin/ui/icons";

type EventOption = { id: string; name: string; startsAt: string; venueName: string; city: string };
type ScanResult =
  | { ok: true; name: string; remaining: number }
  | { ok: false; reason: string; message: string; checkedInAt?: string; name?: string };

type Attendee = { id: string; code: string; name: string; email: string; phone: string; type: string; status: string; checkedInAt?: string };

const QUEUE_KEY = "serenart.checkin.queue";

function loadQueue(): { eventId: string; token: string; at: number }[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]"); } catch { return []; }
}
function saveQueue(q: { eventId: string; token: string; at: number }[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export function CheckInClient() {
  const sp = useSearchParams();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState(sp.get("event") ?? "");
  const [state, setState] = useState<{ total: number; checkedIn: number; remaining: number; attendees: Attendee[] } | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");
  const [muted, setMuted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState("");
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [queueCount, setQueueCount] = useState(() => (typeof window === "undefined" ? 0 : loadQueue().length));
  const [searchQ, setSearchQ] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load events (today's first, else upcoming).
  useEffect(() => {
    fetch("/api/v1/admin/check-in?today=1")
      .then((r) => r.json())
      .then((d) => {
        const list = d.data?.events ?? [];
        setEvents(list);
        setEventId((cur) => cur || list[0]?.id || "");
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async (q?: string) => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/v1/admin/check-in?event=${eventId}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      const d = await res.json();
      if (d.success) setState(d.data);
    } catch { /* keep last state */ }
  }, [eventId]);

  useEffect(() => { void Promise.resolve().then(() => refresh()); }, [refresh]);

  // Online/offline + flush queued scans.
  useEffect(() => {
    const on = () => { setOffline(false); flushQueue(); };
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function flushQueue() {
    const q = loadQueue();
    if (!q.length) return;
    const left: typeof q = [];
    for (const item of q) {
      if (item.eventId !== eventId) { left.push(item); continue; }
      try {
        await fetch("/api/v1/admin/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: item.eventId, token: item.token }),
        });
      } catch {
        left.push(item);
      }
    }
    saveQueue(left);
    setQueueCount(left.length);
    refresh();
  }

  function beep(ok: boolean) {
    if (muted) return;
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = ok ? 880 : 220;
      o.connect(g); g.connect(ctx.destination);
      g.gain.value = 0.08;
      o.start(); o.stop(ctx.currentTime + (ok ? 0.12 : 0.3));
    } catch { /* no audio — fine */ }
    try { navigator.vibrate?.(ok ? 60 : [60, 40, 60]); } catch { /* noop */ }
  }

  const doScan = useCallback(async (token: string) => {
    if (!eventId || !token.trim()) return;
    clearTimeout(resultTimer.current);

    if (!navigator.onLine) {
      const q = loadQueue();
      q.push({ eventId, token: token.trim(), at: Date.now() });
      saveQueue(q);
      setQueueCount(q.length);
      setResult({ ok: true, name: "Queued offline", remaining: -1 });
      beep(true);
      resultTimer.current = setTimeout(() => setResult(null), 2500);
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, token: token.trim() }),
      });
      const d = await res.json();
      const r: ScanResult = d.success ? d.data : { ok: false, reason: "invalid", message: d.error || "Something went wrong." };
      setResult(r);
      beep(r.ok);
      if (r.ok) refresh();
    } catch {
      const q = loadQueue();
      q.push({ eventId, token: token.trim(), at: Date.now() });
      saveQueue(q);
      setQueueCount(q.length);
      setResult({ ok: true, name: "Queued offline", remaining: -1 });
      beep(true);
    }
    resultTimer.current = setTimeout(() => setResult(null), 3500);
  }, [eventId, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  // QR scanner lifecycle.
  useEffect(() => {
    if (!scanning || !eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 220, height: 220 } },
          (decoded) => { doScan(decoded); },
          () => {},
        );
        if (cancelled) scanner.stop().catch(() => {});
      } catch (e) {
        setCamError((e as Error).message?.includes("Permission") ? "Camera permission denied — type the code instead." : "Couldn't start the camera. Type the code instead.");
        setScanning(false);
      }
    })();
    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current = null;
    };
  }, [scanning, eventId, doScan]);

  async function undoCheckin(code: string) {
    const res = await fetch("/api/v1/admin/check-in/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: code }),
    });
    const d = await res.json();
    toast(d.data?.undone ? "Check-in undone." : "Couldn't undo that.", { error: !d.data?.undone });
    refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Offline banner */}
      {(offline || queueCount > 0) && (
        <div className="a-card mb-3 flex items-center gap-2 px-4 py-2 text-sm font-bold" style={{ background: "var(--admin-amber-bg)", color: "var(--admin-amber)" }} role="status">
          <Icon name="signal" size={16} />
          {offline ? `You're offline — scans are saved and will sync.` : `${queueCount} scan${queueCount === 1 ? "" : "s"} waiting to sync.`}
          {!offline && queueCount > 0 && <button className="a-btn a-btn-ghost a-btn-sm ml-auto" onClick={flushQueue}>Sync now</button>}
        </div>
      )}

      {/* Event picker */}
      {events.length === 0 ? (
        <div className="a-card p-6 text-center">
          <p className="font-bold">No events today.</p>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-ink-soft)" }}>Nothing published is happening soon. Check the events page.</p>
        </div>
      ) : (
        <select className="a-select mb-3" value={eventId} onChange={(e) => setEventId(e.target.value)} aria-label="Pick the event">
          {events.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.venueName}</option>)}
        </select>
      )}

      {/* Counter */}
      {state && (
        <div className="a-card mb-3 p-5 text-center">
          <p className="admin-title text-5xl font-extrabold" style={{ color: "var(--green)" }}>
            {state.checkedIn}<span className="text-2xl" style={{ color: "var(--admin-ink-soft)" }}>/{state.total}</span>
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--admin-ink-soft)" }}>{state.remaining} still to arrive</p>
          <div className="a-bar mt-3" aria-hidden>
            <div className="a-bar-fill" style={{ width: state.total ? `${(state.checkedIn / state.total) * 100}%` : "0%", background: "var(--orange)" }} />
          </div>
        </div>
      )}

      {/* Scanner + manual */}
      <div className="a-card mb-3 p-4">
        {scanning ? (
          <div>
            <div id="qr-reader" className="overflow-hidden rounded-xl" style={{ minHeight: 220 }} />
            <button className="a-btn a-btn-ghost mt-3 w-full" onClick={() => setScanning(false)}>Stop camera</button>
          </div>
        ) : (
          <button className="a-btn a-btn-green w-full min-h-[52px] text-base" onClick={() => { setCamError(""); setScanning(true); }}>
            <Icon name="scan" size={18} /> Start scanning
          </button>
        )}
        {camError && <p className="a-error-text mt-2" role="alert">{camError}</p>}

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); doScan(manual); setManual(""); }}
        >
          <input
            className="a-input min-h-[52px] text-base"
            placeholder="Type ticket code…"
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            aria-label="Ticket code"
          />
          <button type="submit" className="a-btn a-btn-orange min-h-[52px]">Check in</button>
        </form>
        <button className="a-btn a-btn-ghost a-btn-sm mt-2" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
          <Icon name={muted ? "mute" : "sound"} size={14} /> {muted ? "Sound off" : "Sound on"}
        </button>
      </div>

      {/* Attendee search */}
      {state && state.attendees.length > 0 && (
        <div className="a-card p-4">
          <input
            className="a-input min-h-[48px]"
            placeholder="Find a guest — name, code, phone…"
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); refresh(e.target.value || undefined); }}
            aria-label="Search guests"
          />
          <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
            {state.attendees.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5" style={{ background: a.status === "CHECKED_IN" ? "var(--mint)" : "var(--admin-canvas)" }}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{a.name}</p>
                  <p className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>{a.type} · <span className="font-mono">{a.code}</span></p>
                </div>
                {a.status === "CHECKED_IN" ? (
                  <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => undoCheckin(a.code)}>Undo</button>
                ) : a.status === "VOID" ? (
                  <span className="a-chip a-chip-refunded">Void</span>
                ) : (
                  <button className="a-btn a-btn-orange a-btn-sm min-h-[44px]" onClick={() => doScan(a.code)}>Check in</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full-screen result */}
      {result && (
        <div
          role="alert"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
          style={{ background: result.ok ? "var(--green)" : result.reason === "already" ? "var(--admin-amber)" : "var(--admin-red)", color: "#fff" }}
          onClick={() => setResult(null)}
        >
          <p className="text-6xl" aria-hidden>{result.ok ? "✓" : "✕"}</p>
          <p className="admin-title mt-4 text-3xl font-extrabold">
            {result.ok ? `Welcome in${result.name !== "Queued offline" ? `, ${result.name}` : ""}` : result.message}
          </p>
          {!result.ok && result.checkedInAt && (
            <p className="mt-2 text-lg opacity-90">Checked in at {format(new Date(result.checkedInAt), "h:mma")}</p>
          )}
          {result.ok && result.remaining >= 0 && <p className="mt-2 text-lg opacity-90">{result.remaining} left to check in</p>}
          <p className="mt-8 text-sm opacity-70">Tap anywhere to continue</p>
        </div>
      )}
    </div>
  );
}
