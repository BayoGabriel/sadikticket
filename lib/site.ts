// Public site configuration — safe to import from client components.
// Values come from NEXT_PUBLIC_* env vars; fallbacks mirror the design
// doc placeholders until the real details are supplied.

export const site = {
  name: "SerenArt",
  tagline: "Fun things to do with people, in Lagos and Benin City.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "[number]",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  emailDisplay: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "[email address]",
  businessEmail:
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "",
  businessEmailDisplay:
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "[business email]",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "",
  instagramDisplay: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE
    ? `@${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE.replace(/^@/, "")}`
    : "@[handle]",
  cities: ["Lagos", "Benin City"],
};

export function whatsappUrl(message?: string) {
  if (!site.whatsapp) return "";
  const base = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
