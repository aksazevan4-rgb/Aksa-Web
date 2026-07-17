import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const config = await getSiteConfig();
  const base = config.siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
