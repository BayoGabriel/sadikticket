import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/navigation/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discover events and get tickets | SerenArt",
  description:
    "Find events, buy tickets securely with Paystack, and get QR-code tickets for seamless check-in.",
  openGraph: {
    title: "Discover events and get tickets | SerenArt",
    description:
      "Find events, buy tickets securely with Paystack, and get QR-code tickets for seamless check-in.",
    url: "/",
    siteName: "SerenArt",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-(--surface-muted) text-(--text-primary)">
        <Header />
        {children}
      </body>
    </html>
  );
}
