"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, whatsappUrl } from "@/lib/site-config";
import { NotifyForm } from "@/components/forms/NotifyForm";

const cityHref = (city: string) =>
  `/${city.toLowerCase().replace(/\s+/g, "-")}`;

// DB-backed settings passed down from the (server) root layout. Anything
// unset falls back to the env-driven siteConfig, so nothing changes until
// the team edits Site settings in admin.
export type FooterSettings = {
  whatsappNumber?: string;
  contactEmail?: string;
  businessEmail?: string;
  instagramHandle?: string;
  cities?: string[];
};

export function Footer({ settings }: { settings?: FooterSettings }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isBusiness = pathname?.startsWith("/business");

  const whatsapp = settings?.whatsappNumber || siteConfig.whatsapp;
  const whatsappDisplay = whatsapp || siteConfig.whatsappDisplay;
  const email = settings?.contactEmail || siteConfig.email;
  const emailDisplay = email || siteConfig.emailDisplay;
  const businessEmail = settings?.businessEmail || siteConfig.businessEmail;
  const businessEmailDisplay = businessEmail || siteConfig.businessEmailDisplay;
  const instagramDisplay = settings?.instagramHandle
    ? `@${settings.instagramHandle.replace(/^@/, "")}`
    : siteConfig.instagramDisplay;
  const cities = settings?.cities?.length ? settings.cities : siteConfig.cities;
  const wa = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}`
    : whatsappUrl();

  if (isAdmin) return null;

  // SerenArt Business gets its own, calmer footer.
  if (isBusiness) {
    return (
      <footer className="border-t border-[#e8e8e5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-10 sm:px-8 lg:px-10">
          <div>
            <span className="font-display text-lg font-semibold text-[#003118]">
              SerenArt Business
            </span>
            <p className="mt-1 text-sm text-(--text-muted)">
              {businessEmail ? (
                <a
                  href={`mailto:${businessEmail}`}
                  className="hover:text-[#003118]"
                >
                  {businessEmailDisplay}
                </a>
              ) : (
                businessEmailDisplay
              )}
            </p>
          </div>
          <div className="flex gap-6 text-sm text-(--text-muted)">
            <Link href="/terms" className="hover:text-[#003118]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#003118]">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[#e8e8e5] bg-[#003118] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="font-display text-xl font-semibold tracking-tight">
              SerenArt
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
              {siteConfig.tagline}
            </p>
            <p className="mt-6 text-sm font-medium text-white/90">
              Want first dibs on tickets? Drop your email.
            </p>
            <NotifyForm
              kind="updates"
              buttonLabel="Tell me first"
              className="mt-3 max-w-xs"
              successMessage="Done. You'll hear from us first."
              successClassName="text-white"
            />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Explore
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Events", "/events"],
                ["Experiences", "/experiences"],
                ["Private Bookings", "/private-bookings"],
                ["SerenArt Business", "/business"],
                ["Gallery", "/gallery"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Cities
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {cities.map((c) => (
                <li key={c}>
                  <Link
                    href={cityHref(c)}
                    className="text-white/80 hover:text-white"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Say hi
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                {wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    WhatsApp: {whatsappDisplay}
                  </a>
                ) : (
                  <>WhatsApp: {whatsappDisplay}</>
                )}
              </li>
              <li>
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-white"
                  >
                    {emailDisplay}
                  </a>
                ) : (
                  emailDisplay
                )}
              </li>
              <li>Instagram: {instagramDisplay}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-xs text-white/60">
          <span>© SerenArt</span>
          <Link href="/refunds" className="hover:text-white">
            Refunds and Cancellations
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/faqs" className="hover:text-white">
            FAQs
          </Link>
        </div>
      </div>
    </footer>
  );
}
