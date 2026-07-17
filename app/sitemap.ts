import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getSiteConfig();
  const base = config.siteUrl.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/register`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      profileVisibility: "PUBLIC",
      accountStatus: "ACTIVE",
    },
    select: { username: true, updatedAt: true },
    take: 5000,
  });

  const profileRoutes: MetadataRoute.Sitemap = users.map((u) => ({
    url: `${base}/${u.username}`,
    lastModified: u.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...profileRoutes];
}
