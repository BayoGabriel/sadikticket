import type { NextConfig } from "next";

// Client-side code (Footer, forms, TicketPicker, WhatsApp buttons) reads
// contact details via NEXT_PUBLIC_* vars, because Next.js only inlines
// NEXT_PUBLIC_* into the browser bundle. The production env uses the
// NEXT_* names instead — map them here so either spelling works.
const env: Record<string, string> = {};
for (const key of [
  "WHATSAPP_NUMBER",
  "CONTACT_EMAIL",
  "BUSINESS_EMAIL",
  "INSTAGRAM_HANDLE",
] as const) {
  const value =
    process.env[`NEXT_PUBLIC_${key}`] ?? process.env[`NEXT_${key}`];
  if (value) env[`NEXT_PUBLIC_${key}`] = value;
}

const nextConfig: NextConfig = {
  env,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
