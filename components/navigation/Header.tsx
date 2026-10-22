"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/assets/images/artlogo.png";

const links = [
  { href: "/events", label: "Events" },
  { href: "/experiences", label: "Experiences" },
  { href: "/private-bookings", label: "Private Bookings" },
  { href: "/business", label: "SerenArt Business" },
  { href: "/gallery", label: "Gallery" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isBusiness = pathname?.startsWith("/business");
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => setOpen(false), [pathname]);

  if (isAdmin) return null;

  const cta = isBusiness
    ? { href: "/business#enquire", label: "Plan a team experience", cls: "btn btn-green" }
    : { href: "/events", label: "Get Tickets", cls: "btn btn-orange" };

  return (
    <header className="sticky top-0 z-40 border-b border-(--border) bg-(--surface-muted)/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="SerenArt home">
          <Image src={Logo} alt="SerenArt" width={100} height={100} />
          {isBusiness && (
            <span className="rounded-full border border-[#003118]/25 px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-[#003118]">
              BUSINESS
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {links.map((l) => {
            const active =
              l.href === "/events"
                ? pathname?.startsWith("/events") ||
                  pathname === "/lagos" ||
                  pathname === "/benin-city"
                : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition hover:text-[#f27a00] ${
                  active ? "text-[#f27a00]" : "text-(--text-primary)"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link href={cta.href} className={`${cta.cls} !min-h-0 px-5 py-2.5 text-sm`}>
            {cta.label}
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-2xl leading-none text-[#003118]">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-(--border) bg-(--surface-muted) lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-3 py-3 text-base font-medium ${
                    active ? "text-[#f27a00]" : "text-(--text-primary)"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link href={cta.href} className={`${cta.cls} mt-2 w-fit`}>
              {cta.label}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
