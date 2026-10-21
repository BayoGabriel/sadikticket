import Link from "next/link";
import { site } from "@/lib/site";
import { NotifyForm } from "@/components/forms/NotifyForm";
import { whatsappUrl } from "@/lib/site";

export function Footer() {
  const wa = whatsappUrl();
  return (
    <footer className="border-t border-[#e8e8e5] bg-[#003118] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="text-xl font-semibold tracking-tight">SerenArt</div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
              {site.tagline}
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
              <li>
                <Link href="/events" className="text-white/80 hover:text-white">
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/experiences"
                  className="text-white/80 hover:text-white"
                >
                  Experiences
                </Link>
              </li>
              <li>
                <Link
                  href="/private-bookings"
                  className="text-white/80 hover:text-white"
                >
                  Private Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="text-white/80 hover:text-white"
                >
                  SerenArt Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
              Cities
            </div>
            <ul className="mt-4 space-y-2.5 text-sm">
              {site.cities.map((c) => (
                <li key={c}>
                  <Link
                    href={`/events?city=${encodeURIComponent(c)}`}
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
                    WhatsApp: {site.whatsappDisplay}
                  </a>
                ) : (
                  <>WhatsApp: {site.whatsappDisplay}</>
                )}
              </li>
              <li>
                {site.email ? (
                  <a href={`mailto:${site.email}`} className="hover:text-white">
                    {site.emailDisplay}
                  </a>
                ) : (
                  site.emailDisplay
                )}
              </li>
              <li>Instagram: {site.instagramDisplay}</li>
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
