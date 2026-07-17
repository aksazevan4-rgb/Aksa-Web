/**
 * components/profile/layouts/types.ts
 *
 * Shared props contract for all profile layouts. Every layout component
 * (Classic, Modern, Glass, Minimal, ...) receives the exact same props
 * and renders them differently. Adding a new layout means creating a
 * new component implementing this interface — no changes needed to the
 * page that calls it.
 */

import type { ProfileThemePreset } from "@/lib/profile-themes";
import type { LanyardPresence } from "@/lib/lanyard";
import type { ActiveWidget } from "@/lib/widget-registry";

export interface ProfileLinkData {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  description?: string | null;
  color?: string | null;
  openInNewTab?: boolean;
  hasPassword?: boolean;
}

export interface GuestbookEntryData {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface SocialLinkData {
  id: string;
  label: string;
  url: string;
}

/** docs/11-public-profile.md §5 — subset field Badge yang aman ditampilkan
 * publik (tanpa requirement/priceCredits internal). */
export interface FeaturedBadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "LIMITED";
}

export interface ProfileLayoutProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
    bannerImage: string | null;
    plan: "FREE" | "PREMIUM";
    role: "ADMIN" | "USER";
    isFounder: boolean;
    discordId: string | null;
    profileViews: number;
  };
  theme: ProfileThemePreset;
  borderStyle: string | null;
  fontFamily: string;
  backgroundStyle: React.CSSProperties;
  /** Raw config (type/colors/mediaUrl) alongside the computed backgroundStyle — needed by aurora/galaxy/particles/neon/image/video, which render extra DOM layers via <ProfileBackgroundFX> rather than being expressible as a single CSS background. */
  background: { type: string; colors?: string[]; mediaUrl?: string };
  activeWidgets: ActiveWidget[];
  links: ProfileLinkData[];
  socials: SocialLinkData[];
  discordPresence: LanyardPresence | null;
  showDiscordActivity: boolean;
  showSpotify: boolean;
  isOwner: boolean;
  isViewerAdmin: boolean;
  poweredByVisible: boolean;
  siteName: string;
  guestbookEntries?: GuestbookEntryData[];
  reactionCounts?: Record<string, number>;
  /** Optional — layout yang belum diupdate untuk menampilkannya tetap
   * type-safe (docs/18 §4: jangan sampai ada breaking change). */
  featuredBadges?: FeaturedBadgeData[];
  /** docs/09-widget-system.md §3 — dipakai StatisticsWidget lewat ExtraWidgets */
  totalLinkClicks?: number;
  badgesCount?: number;
  rssFeedTitles?: string[];
  cryptoPrices?: Record<string, number>;
  /** User.backgroundAudioUrl — profile background music, used by layouts
   * that render a "now playing" bar (e.g. ShowcaseLayout). Optional so
   * layouts that don't render it stay type-safe. */
  backgroundAudioUrl?: string | null;
}
