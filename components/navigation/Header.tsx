"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/assets/images/artlogo.png";

const links = [
  { href: "/events", label: "Events" },
  { href: "/experiences", label: "Experiences" },
  { href: "/private-bookings", label: "Private Bookings" },
  { href: "/business", label: "SerenArt Business" },
  { href: "/gallery", label: "Gallery" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-(--surface-muted)/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="SerenArt home">
          <Image src={Logo} alt="SerenArt" width={100} height={100} />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-(--text-primary) transition hover:text-(--brand-accent)"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/events"
            className="inline-flex items-center rounded-full bg-(--brand-accent) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--brand-accent-hover)"
          >
            Get Tickets
          </Link>
        </div>

        <button
          aria-label="Open menu"
          className="inline-flex items-center p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-6 w-6 text-xl leading-6">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-(--border) bg-white lg:hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-(--text-primary)"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className="inline-flex w-fit items-center rounded-full bg-(--brand-accent) px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Get Tickets
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
