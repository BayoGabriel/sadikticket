"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/assets/images/artlogo.png";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAF8]/80 backdrop-blur border-b border-[#E8E8E5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-[#171717] text-lg">
          <Image src={Logo} alt="SerenArt" width={100} height={100} />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-[#171717] hover:text-emerald-700">
            Discover
          </Link>
          <Link href="/about" className="text-[#171717] hover:text-emerald-700">
            About
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-[#171717] hover:text-emerald-700">
            Login
          </Link>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-emerald-700 transition"
          >
            Create Event
          </Link>
        </div>
        <button
          aria-label="Open menu"
          className="md:hidden inline-flex items-center p-2"
          onClick={() => setOpen(true)}
        >
          <span className="i-lucide-menu h-6 w-6">☰</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[#E8E8E5] bg-white">
          <div className="px-4 py-3 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-[#171717]"
            >
              Discover
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-[#171717]"
            >
              About
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-[#171717]"
            >
              Login
            </Link>
            <Link
              href="/admin/events/new"
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              Create Event
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
