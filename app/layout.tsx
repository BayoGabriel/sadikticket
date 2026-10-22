import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { StickyTicketsBar } from "@/components/ui/StickyTicketsBar";
import { siteConfig } from "@/lib/site-config";
import { settingsService } from "@/services/settingsService";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "SerenArt — Life's Too Short for Boring Plans",
    template: "%s | SerenArt",
  },
  description: siteConfig.tagline,
  openGraph: {
    siteName: "SerenArt",
    type: "website",
    locale: "en_NG",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Site settings — DB-backed; falls back to env-driven defaults when unset
  // or when the DB is unreachable, so the public site never breaks.
  let settings;
  try {
    settings = await settingsService.getPublic();
  } catch {
    settings = null;
  }
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--surface-muted) text-(--text-primary)">
        {settings?.announcementEnabled && settings.announcementText ? (
          <div className="bg-[#f27a00] px-4 py-2 text-center text-sm font-semibold text-[#003118]">
            {settings.announcementText}
          </div>
        ) : null}
        <Header />
        {children}
        <Footer settings={settings ?? undefined} />
        <StickyTicketsBar enabled={settings?.stickyMobileBanner ?? true} />
      </body>
    </html>
  );
}
