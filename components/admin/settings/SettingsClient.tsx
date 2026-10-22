"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { ChipInput } from "@/components/admin/ui/ChipInput";
import { useToast } from "@/components/admin/ui/Toast";

export type SettingsShape = {
  whatsappNumber: string;
  contactEmail: string;
  businessEmail: string;
  instagramHandle: string;
  enquiryNotifyEmails: string[];
  responseTime: string;
  cities: string[];
  fewLeftThreshold: number;
  stickyMobileBanner: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  refundSummary: string;
  policies: { ageLimit: string; whatToWear: string; runningLate: string };
};

type EnvFlags = {
  paystackConfigured: boolean;
  paystackLive: boolean;
  smtpConfigured: boolean;
  cronConfigured: boolean;
  storageConfigured: boolean;
};

function EnvBadge({ ok, label, off }: { ok: boolean; label: string; off: string }) {
  return (
    <span className={`a-chip ${ok ? "a-chip-green" : "a-chip-amber"}`}>
      {ok ? label : off}
    </span>
  );
}

export function SettingsClient({ initial, env }: { initial: SettingsShape; env: EnvFlags }) {
  const { toast } = useToast();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof SettingsShape>(k: K, v: SettingsShape[K]) => setS({ ...s, [k]: v });
  const setPolicy = (k: keyof SettingsShape["policies"], v: string) =>
    setS({ ...s, policies: { ...s.policies, [k]: v } });

  const whatsappPreview = s.whatsappNumber
    ? `https://wa.me/${s.whatsappNumber.replace(/\D/g, "")}`
    : "";

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save — check the fields.");
      toast("Saved — live on the site now.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 max-w-3xl space-y-4">
      {/* Contact */}
      <section className="a-card p-5">
        <h2 className="admin-title text-base font-bold">Contact details</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
          Used in the site footer, WhatsApp buttons and enquiry replies. Blank = the env-variable value wins.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="WhatsApp number"
            hint={whatsappPreview ? `Test link: ${whatsappPreview}` : "e.g. 2348012345678 (international format, no +)"}
          >
            <input className="a-input" value={s.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="2348…" />
          </Field>
          <Field label="General email">
            <input className="a-input" type="email" value={s.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="hello@…" />
          </Field>
          <Field label="Business enquiries email">
            <input className="a-input" type="email" value={s.businessEmail} onChange={(e) => set("businessEmail", e.target.value)} placeholder="business@…" />
          </Field>
          <Field label="Instagram handle" hint="Without the @">
            <input className="a-input" value={s.instagramHandle} onChange={(e) => set("instagramHandle", e.target.value)} placeholder="serenart" />
          </Field>
        </div>
      </section>

      {/* Enquiries */}
      <section className="a-card p-5">
        <h2 className="admin-title text-base font-bold">Enquiries</h2>
        <div className="mt-4 space-y-4">
          <Field label="Who gets notified" hint="New enquiry emails go to these addresses.">
            <ChipInput value={s.enquiryNotifyEmails} onChange={(v) => set("enquiryNotifyEmails", v)} placeholder="add an email, press Enter" />
          </Field>
          <Field label="How fast you reply" hint="Shown to guests after they submit — e.g. “within a day”, “in about 2 hours”.">
            <input className="a-input" value={s.responseTime} onChange={(e) => set("responseTime", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Site behaviour */}
      <section className="a-card p-5">
        <h2 className="admin-title text-base font-bold">Site behaviour</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cities" hint="Shows in the footer, contact page and event filters.">
            <ChipInput value={s.cities} onChange={(v) => set("cities", v)} placeholder="e.g. Lagos" />
          </Field>
          <Field label="“Few tickets left” threshold" hint="When this many or fewer tickets remain, the event card says Few left.">
            <input type="number" min={0} className="a-input w-28" value={s.fewLeftThreshold} onChange={(e) => set("fewLeftThreshold", Number(e.target.value) || 0)} />
          </Field>
        </div>
        <div className="mt-4 space-y-2">
          <Toggle checked={s.stickyMobileBanner} onChange={(v) => set("stickyMobileBanner", v)} label="Sticky “Get tickets” bar on phones" />
          <Toggle checked={s.announcementEnabled} onChange={(v) => set("announcementEnabled", v)} label="Announcement bar at the top of the site" />
          {s.announcementEnabled && (
            <Field label="Announcement text">
              <input className="a-input" value={s.announcementText} onChange={(e) => set("announcementText", e.target.value)} placeholder="e.g. December events are live!" />
            </Field>
          )}
        </div>
      </section>

      {/* Policies */}
      <section className="a-card p-5">
        <h2 className="admin-title text-base font-bold">The small print</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
          Short answers shown in “Good to know” on every event page. Long versions live in Policies & pages.
        </p>
        <div className="mt-4 space-y-4">
          <Field label="Refunds — short version" hint="One or two lines on when refunds apply.">
            <textarea className="a-input min-h-16" value={s.refundSummary} onChange={(e) => set("refundSummary", e.target.value)} />
          </Field>
          <Field label="Age limit">
            <textarea className="a-input min-h-14" value={s.policies.ageLimit} onChange={(e) => setPolicy("ageLimit", e.target.value)} />
          </Field>
          <Field label="What to wear">
            <textarea className="a-input min-h-14" value={s.policies.whatToWear} onChange={(e) => setPolicy("whatToWear", e.target.value)} />
          </Field>
          <Field label="Running late">
            <textarea className="a-input min-h-14" value={s.policies.runningLate} onChange={(e) => setPolicy("runningLate", e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Integrations — read-only indicators */}
      <section className="a-card p-5">
        <h2 className="admin-title text-base font-bold">Connections</h2>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-ink-soft)" }}>
          Set in environment variables — never shown here for safety.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <EnvBadge
            ok={env.paystackConfigured}
            label={env.paystackLive ? "Paystack · LIVE" : "Paystack · test mode"}
            off="Paystack · not configured"
          />
          <EnvBadge ok={env.smtpConfigured} label="Email · configured" off="Email · not configured" />
          <EnvBadge ok={env.storageConfigured} label="Media storage · configured" off="Storage · not configured" />
          <EnvBadge ok={env.cronConfigured} label="Cron · configured" off="Cron · not configured" />
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <button type="button" onClick={() => void save()} disabled={saving} className="a-btn a-btn-orange shadow-lg">
          <Icon name="check" size={16} /> {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
