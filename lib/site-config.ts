/**
 * lib/site-config.ts
 *
 * Reads global site configuration from the SiteConfig table.
 * Cached with Next.js unstable_cache — revalidated on admin update.
 *
 * Never import this in client components. Pass values as props from
 * server components or layout.
 */

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type SiteConfigData = {
  siteName: string;
  siteUrl: string;
  logoUrl: string | null;
  siteTitle: string;
  siteDescription: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  poweredByVisible: boolean;
  showAksaIdShowcase: boolean;
  aksaIdDiscordUrl: string | null;
  aksaIdDescription: string | null;
  socialGithub: string | null;
  socialDiscord: string | null;
  socialInstagram: string | null;
  socialYoutube: string | null;
  socialTiktok: string | null;
  socialWebsite: string | null;
};

const DEFAULTS: SiteConfigData = {
  siteName: "AKSA",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://aksa.example.com",
  logoUrl: null,
  siteTitle: "AKSA — Build Your Premium Profile",
  siteDescription:
    "Create a stunning personal profile page with Discord integration, custom themes, and more.",
  allowRegistration: true,
  maintenanceMode: false,
  poweredByVisible: true,
  showAksaIdShowcase: true,
  aksaIdDiscordUrl: null,
  aksaIdDescription: null,
  socialGithub: null,
  socialDiscord: null,
  socialInstagram: null,
  socialYoutube: null,
  socialTiktok: null,
  socialWebsite: null,
};

export const getSiteConfig = unstable_cache(
  async (): Promise<SiteConfigData> => {
    try {
      const config = await prisma.siteConfig.findUnique({
        where: { id: "config" },
      });
      if (!config) return DEFAULTS;
      return {
        siteName: config.siteName,
        siteUrl: config.siteUrl,
        logoUrl: config.logoUrl,
        siteTitle: config.siteTitle,
        siteDescription: config.siteDescription,
        allowRegistration: config.allowRegistration,
        maintenanceMode: config.maintenanceMode,
        poweredByVisible: config.poweredByVisible,
        showAksaIdShowcase: config.showAksaIdShowcase,
        aksaIdDiscordUrl: config.aksaIdDiscordUrl,
        aksaIdDescription: config.aksaIdDescription,
        socialGithub: config.socialGithub,
        socialDiscord: config.socialDiscord,
        socialInstagram: config.socialInstagram,
        socialYoutube: config.socialYoutube,
        socialTiktok: config.socialTiktok,
        socialWebsite: config.socialWebsite,
      };
    } catch {
      return DEFAULTS;
    }
  },
  ["site-config"],
  { revalidate: 120, tags: ["site-config"] }
);
