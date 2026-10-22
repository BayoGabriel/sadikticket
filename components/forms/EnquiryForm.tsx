"use client";
import { useRef, useState } from "react";
import { siteConfig, whatsappUrl } from "@/lib/site-config";

const inputCls =
  "mt-1 w-full rounded-xl border border-[#e0dfcf] bg-white px-3.5 py-2.5 text-sm text-[#003118] outline-none transition focus:border-[#003118]/40 focus:ring-2 focus:ring-[#003118]/10";
const labelCls = "block text-sm font-medium text-[#003118]";
const helperCls = "mt-1 text-xs italic text-[#8a8a7d]";

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {helper && <p className={helperCls}>{helper}</p>}
    </div>
  );
}

const OCCASIONS = [
  "Birthday",
  "Bridal shower",
  "Anniversary",
  "Hangout",
  "Baby shower",
  "Reunion",
  "Other",
];

const SERVICES = [
  "Team bonding",
  "Celebration",
  "Retreat",
  "Brand activation",
  "Not sure",
];

const PLACES = ["Lagos", "Benin City", "Somewhere else"];

// Turn the current form values into a readable WhatsApp opener.
function waMessage(kind: "private-booking" | "business", fd: FormData) {
  const parts: string[] = [
    kind === "private-booking"
      ? "Hi SerenArt! I'm planning something."
      : "Hi SerenArt Business! I'd like to plan a team experience.",
  ];
  const push = (label: string, v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    if (s) parts.push(`${label}: ${s}`);
  };
  push("Name", fd.get("name"));
  push("Company", fd.get("company"));
  push("Celebrating", fd.get("occasion"));
  push("Looking for", fd.get("service"));
  push("Want to do", fd.get("experience"));
  push("When", fd.get("date"));
  push("People", fd.get("guests") || fd.get("size"));
  push("Where", fd.get("location"));
  push("Details", fd.get("extra") || fd.get("goals"));
  return parts.join("\n");
}

export function EnquiryForm({ kind }: { kind: "private-booking" | "business" }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isPrivate = kind === "private-booking";

  // WhatsApp link is rebuilt from whatever the guest has typed so far.
  const [waHref, setWaHref] = useState(() =>
    whatsappUrl(
      isPrivate
        ? "Hi SerenArt! I'd like to plan a private event."
        : "Hi SerenArt Business! I'd like to plan a team experience.",
    ),
  );
  const refreshWa = () => {
    if (!formRef.current) return;
    const url = whatsappUrl(waMessage(kind, new FormData(formRef.current)));
    if (url) setWaHref(url);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { kind };
    for (const [k, v] of fd.entries()) {
      const s = String(v).trim();
      if (s) payload[k] = s;
    }
    try {
      const res = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.error?.message || "Something went wrong");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-[#003118]/15 bg-[#e6eeeb] p-6 text-center">
        <p className="font-semibold text-[#003118]">
          {isPrivate
            ? "Got it, thank you!"
            : "Thanks for your interest in SerenArt Business!"}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#4a4a45]">
          {isPrivate
            ? `We'll reach out within ${siteConfig.responseTime} to talk it through. Want to chat now? `
            : "We've received your enquiry and will be in touch to help you plan an experience your team will love. Prefer to chat? "}
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#003118] underline underline-offset-2"
            >
              Message us on WhatsApp.
            </a>
          ) : (
            "Message us on WhatsApp."
          )}
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} onChange={refreshWa} className="space-y-4">
      {/* honeypot — hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input name="name" required className={inputCls} />
        </Field>

        {isPrivate ? (
          <Field label="Email">
            <input name="email" type="email" required className={inputCls} />
          </Field>
        ) : (
          <Field label="Company">
            <input name="company" className={inputCls} />
          </Field>
        )}

        {isPrivate ? (
          <Field
            label="Phone number"
            helper="We'll use it to call or WhatsApp you."
          >
            <input name="phone" type="tel" className={inputCls} />
          </Field>
        ) : (
          <>
            <Field label="Work email">
              <input name="email" type="email" required className={inputCls} />
            </Field>
            <Field label="Phone number">
              <input name="phone" type="tel" className={inputCls} />
            </Field>
          </>
        )}

        {isPrivate ? (
          <>
            <Field label="What are we celebrating?">
              <select name="occasion" className={inputCls} defaultValue="">
                <option value="" disabled>
                  Pick one
                </option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="What would you like to do?"
              helper="Paint, pottery, karaoke, picnic, not sure yet? All fine."
            >
              <input name="experience" className={inputCls} />
            </Field>
            <Field label="When?" helper="Rough date is fine.">
              <input name="date" className={inputCls} />
            </Field>
            <Field label="How many people?">
              <input name="guests" className={inputCls} />
            </Field>
            <Field label="Where?">
              <select name="location" className={inputCls} defaultValue="">
                <option value="" disabled>
                  Pick one
                </option>
                {PLACES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="What are you looking for?">
              <select name="service" className={inputCls} defaultValue="">
                <option value="" disabled>
                  Pick one
                </option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="How many people?">
              <input name="size" className={inputCls} />
            </Field>
            <Field label="Roughly when?">
              <input name="date" className={inputCls} />
            </Field>
            <Field label="Where?">
              <input name="location" className={inputCls} />
            </Field>
            <Field label="One-off or regular?">
              <select name="frequency" className={inputCls} defaultValue="">
                <option value="" disabled>
                  Pick one
                </option>
                <option value="one-off">One-off</option>
                <option value="regular">Regular</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </Field>
          </>
        )}
      </div>

      {isPrivate ? (
        <Field
          label="Anything else we should know?"
          helper="Theme, colours, surprises, allergies, whatever helps."
        >
          <textarea name="extra" rows={4} className={inputCls} />
        </Field>
      ) : (
        <Field label="Tell us what you want to achieve">
          <textarea name="goals" rows={4} className={inputCls} />
        </Field>
      )}

      {state === "error" && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-orange"
        >
          {state === "loading"
            ? "Sending…"
            : isPrivate
              ? "Send my enquiry"
              : "Enquire About a Team Experience"}
        </button>
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#003118] underline underline-offset-4 hover:text-[#f27a00]"
          >
            {isPrivate ? "Or chat on WhatsApp" : "Prefer WhatsApp? Chat with us"}
          </a>
        )}
      </div>
    </form>
  );
}
