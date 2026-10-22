// Single source of truth for all site-wide details that aren't final yet.
// Anything marked "[...]" is a placeholder — replace with real values or set
// the matching NEXT_PUBLIC_* env var (client components read these, so the
// NEXT_PUBLIC_ prefix is required).

export const siteConfig = {
  name: "SerenArt",
  tagline: "Fun things to do with people, in Lagos and Benin City.",
  cities: ["Lagos", "Benin City"] as const,

  // Contact details (public). Either NEXT_PUBLIC_* or NEXT_* env names work —
  // next.config.ts maps NEXT_* → NEXT_PUBLIC_* at build time for the browser,
  // and the fallback reads cover the server side directly.
  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_WHATSAPP_NUMBER ||
    "",
  whatsappDisplay:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_WHATSAPP_NUMBER ||
    "[number]",
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.NEXT_CONTACT_EMAIL ||
    "",
  emailDisplay:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.NEXT_CONTACT_EMAIL ||
    "[email address]",
  businessEmail:
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    process.env.NEXT_BUSINESS_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.NEXT_CONTACT_EMAIL ||
    "",
  businessEmailDisplay:
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    process.env.NEXT_BUSINESS_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    process.env.NEXT_CONTACT_EMAIL ||
    "[business email]",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ||
    process.env.NEXT_INSTAGRAM_HANDLE ||
    "",
  instagramDisplay: (() => {
    const h =
      process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ||
      process.env.NEXT_INSTAGRAM_HANDLE;
    return h ? `@${h.replace(/^@/, "")}` : "@[handle]";
  })(),

  // How fast the team replies to enquiries — used in form confirmations.
  responseTime: "[response time]",

  // Short policy lines shown in the "Good to know" accordion on event pages.
  // Replace with real policies before launch.
  policies: {
    ageLimit: "[Your policy.] Most experiences are 18+, family sessions are marked on the event page.",
    whatToWear: "[Your policy.] Come comfortable — aprons are provided for messy sessions.",
    runningLate: "[Your policy.] Doors stay open — we'll catch you up when you arrive.",
    refunds: "[Your policy.] Two lines on when refunds apply and how to ask.",
  },
};

// Back-compat alias — older components import `site`.
export const site = siteConfig;

export function whatsappUrl(message?: string) {
  if (!siteConfig.whatsapp) return "";
  const base = `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
