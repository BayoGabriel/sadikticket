import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/payment", "/tickets"],
    },
    sitemap: `${env.APP_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
