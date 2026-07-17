/**
 * lib/premium-features.ts
 *
 * Database-driven premium feature access system.
 * NEVER hardcode feature gates in components — always use hasFeatureAccess().
 *
 * Feature keys are defined in the PremiumFeature table and assigned to plans
 * via PremiumPlanFeature. Admin can toggle features via Admin Dashboard.
 *
 * Usage (server component / server action):
 *   const canUseVideo = await hasFeatureAccess(user.plan, "video_background");
 *
 * Usage (client-side, after SSR prefetch):
 *   Pass allowed feature keys as props from server components.
 */

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/** All known feature keys. Keep in sync with seed data. */
export const FEATURE_KEYS = {
  // Profile appearance
  CUSTOM_BACKGROUND_COLOR: "custom_background_color",
  CUSTOM_BACKGROUND_GRADIENT: "custom_background_gradient",
  CUSTOM_BACKGROUND_IMAGE: "custom_background_image",
  CUSTOM_BACKGROUND_VIDEO: "custom_background_video",
  CUSTOM_BACKGROUND_ANIMATED: "custom_background_animated",
  LAYOUT_CLASSIC: "layout_classic",
  LAYOUT_MODERN: "layout_modern",
  LAYOUT_GLASS: "layout_glass",
  LAYOUT_MINIMAL: "layout_minimal",
  LAYOUT_CYBER: "layout_cyber",
  LAYOUT_NEON: "layout_neon",
  BORDER_GLOW: "border_glow",
  BORDER_ANIMATED: "border_animated",
  BORDER_RAINBOW: "border_rainbow",
  CUSTOM_FONT: "custom_font",

  // Widgets
  WIDGET_ABOUT: "widget_about",
  WIDGET_STATUS: "widget_status",
  WIDGET_SOCIAL: "widget_social",
  WIDGET_DISCORD: "widget_discord",
  WIDGET_DISCORD_ACTIVITY: "widget_discord_activity",
  WIDGET_SPOTIFY: "widget_spotify",
  WIDGET_SKILLS: "widget_skills",
  WIDGET_PROJECTS: "widget_projects",
  WIDGET_GALLERY: "widget_gallery",
  WIDGET_VISITOR_COUNT: "widget_visitor_count",
  WIDGET_TESTIMONIALS: "widget_testimonials",
  WIDGET_CONTACT: "widget_contact",
  WIDGET_DONATE: "widget_donate",
  WIDGET_TIMELINE: "widget_timeline",
  WIDGET_EMBED: "widget_embed",
  WIDGET_CUSTOM_HTML: "widget_custom_html",
  // Fase 2 (docs/09-widget-system.md §3)
  WIDGET_STATISTICS: "widget_statistics",
  WIDGET_GITHUB_GRAPH: "widget_github_graph",
  WIDGET_CRYPTO_TICKER: "widget_crypto_ticker",
  WIDGET_RSS_FEED: "widget_rss_feed",

  // Links
  LINKS_UNLIMITED: "links_unlimited",     // FREE = 5 max, PREMIUM = unlimited
  LINKS_CUSTOM_ICON: "links_custom_icon",

  // Analytics
  ANALYTICS_BASIC: "analytics_basic",
  ANALYTICS_ADVANCED: "analytics_advanced",

  // Platform
  REMOVE_POWERED_BY: "remove_powered_by",
  CUSTOM_DOMAIN: "custom_domain",
  CUSTOM_CSS: "custom_css",
  PRIORITY_SUPPORT: "priority_support",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

/**
 * Fetch all feature keys accessible to a given plan name.
 * Results are cached for 60s to avoid per-request DB hits.
 * Cache is invalidated when admin updates premium config.
 */
const getPlanFeatureKeys = unstable_cache(
  async (planName: string): Promise<string[]> => {
    const plan = await prisma.premiumPlan.findUnique({
      where: { name: planName },
      include: {
        features: {
          where: { feature: { isActive: true } },
          include: { feature: { select: { key: true } } },
        },
      },
    });

    if (!plan) return [];
    return plan.features.map((pf) => pf.feature.key);
  },
  ["plan-feature-keys"],
  { revalidate: 60, tags: ["premium-features"] }
);

/**
 * Check if a user's plan has access to a specific feature.
 * Admin always has full access regardless of plan.
 */
export async function hasFeatureAccess(
  planOrRole: { plan: string; role: string },
  featureKey: FeatureKey
): Promise<boolean> {
  // Admin always has full access
  if (planOrRole.role === "ADMIN") return true;

  const keys = await getPlanFeatureKeys(planOrRole.plan);
  return keys.includes(featureKey);
}

/**
 * Fetch ALL accessible feature keys for a user.
 * Pass to client components as a prop.
 */
export async function getUserFeatures(planOrRole: {
  plan: string;
  role: string;
}): Promise<string[]> {
  if (planOrRole.role === "ADMIN") {
    // Admin gets all active features
    const all = await prisma.premiumFeature.findMany({
      where: { isActive: true },
      select: { key: true },
    });
    return all.map((f) => f.key);
  }
  return getPlanFeatureKeys(planOrRole.plan);
}

/** FREE plan link limit (fallback if DB not seeded yet). */
export const FREE_LINK_LIMIT = 5;

/**
 * Get the link limit for a user. Returns Infinity for premium/admin.
 * Uses DB feature check to avoid hardcoding.
 */
export async function getLinkLimit(planOrRole: {
  plan: string;
  role: string;
}): Promise<number> {
  const unlimited = await hasFeatureAccess(planOrRole, FEATURE_KEYS.LINKS_UNLIMITED);
  return unlimited ? Infinity : FREE_LINK_LIMIT;
}
