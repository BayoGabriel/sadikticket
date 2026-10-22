import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { connectDb } from "@/lib/db";
import { EventModel } from "@/models/event";
import { experiences } from "@/lib/experiences";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.APP_URL.replace(/\/$/, "");

  const staticPaths = [
    "",
    "/events",
    "/experiences",
    "/private-bookings",
    "/business",
    "/gallery",
    "/about",
    "/contact",
    "/faqs",
    "/refunds",
    "/terms",
    "/privacy",
    "/lagos",
    "/benin-city",
    ...experiences.map((e) => `/experiences/${e.slug}`),
  ];

  let eventPaths: MetadataRoute.Sitemap = [];
  try {
    await connectDb();
    const events = await EventModel.find({ status: "PUBLISHED" })
      .select("slug updatedAt")
      .lean();
    eventPaths = events.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: e.updatedAt,
    }));
  } catch {
    // DB unreachable — static routes still served
  }

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}` })),
    ...eventPaths,
  ];
}
