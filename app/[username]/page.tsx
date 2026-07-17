import { createElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProfileTheme, getBackgroundStyle, getProfileFont, type ProfileBackgroundConfig } from "@/lib/profile-themes";
import { SOCIAL_PLATFORMS } from "@/app/dashboard/profile/data";
import { getSiteConfig } from "@/lib/site-config";
import { getUserFeatures, hasFeatureAccess } from "@/lib/premium-features";
import { resolveActiveWidgets, type WidgetConfigMap } from "@/lib/widget-registry";
import { resolveDiscordPresence } from "@/lib/lanyard";
import { getLayoutComponent } from "@/components/profile/layouts";
import { ProfileEntryGate } from "@/components/profile/ProfileEntryGate";
import { recordProfileView } from "@/lib/profile-views";
import { fetchFeedTitles } from "@/components/profile/widgets/RssFeedWidget";
import { fetchCryptoPrices } from "@/components/profile/widgets/CryptoTickerWidget";

interface PageProps {
  params: Promise<{ username: string }>;
}

async function getProfileUser(usernameRaw: string) {
  const username = usernameRaw.toLowerCase();
  const select = {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      bannerImage: true,
      socialLinks: true,
      role: true,
      plan: true,
      isFounder: true,
      profileVisibility: true,
      profileTheme: true,
      profileLayout: true,
      profileBackground: true,
      profileBorder: true,
      profileFont: true,
      profileAccentColor: true,
      widgetConfig: true,
      discordId: true,
      discordLinked: true,
      discordPresenceCache: true,
      discordPresenceUpdatedAt: true,
      accountStatus: true,
      profileViews: true,
      backgroundAudioUrl: true,
      links: {
        where: {
          visible: true,
          AND: [
            { OR: [{ scheduledStart: null }, { scheduledStart: { lte: new Date() } }] },
            { OR: [{ scheduledEnd: null }, { scheduledEnd: { gte: new Date() } }] },
          ],
        },
        orderBy: { order: "asc" as const },
        select: {
          id: true,
          label: true,
          url: true,
          icon: true,
          description: true,
          color: true,
          clicks: true,
          openInNewTab: true,
          passwordHash: true,
        },
      },
    };

  const byUsername = await prisma.user.findUnique({ where: { username }, select });
  if (byUsername) return byUsername;

  // Fall back to a vanity alias (see app/dashboard/profile/alias-actions.ts)
  // pointing at the same profile.
  const alias = await prisma.profileAlias.findUnique({
    where: { alias: username },
    select: { userId: true },
  });
  if (!alias) return null;

  return prisma.user.findUnique({ where: { id: alias.userId }, select });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const [user, config] = await Promise.all([getProfileUser(username), getSiteConfig()]);

  if (!user || user.accountStatus !== "ACTIVE") {
    return { title: `Profil tidak ditemukan · ${config.siteName}` };
  }

  const title = `${user.name} (@${user.username}) · ${config.siteName}`;
  const description = user.bio || `Lihat profil ${user.name} di ${config.siteName}.`;
  const ogImageUrl = `${config.siteUrl}/og?username=${user.username}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImageUrl] },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const [user, config] = await Promise.all([getProfileUser(username), getSiteConfig()]);

  if (!user || user.accountStatus !== "ACTIVE") notFound();

  const session = await auth();
  const isOwner = session?.user?.id === user.id;
  const isViewerAdmin = session?.user?.role === "ADMIN";

  if (user.profileVisibility === "PRIVATE" && !isOwner && !isViewerAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
        <div className="glass rounded-2xl p-8 max-w-sm text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-text-tertiary">
            <Lock size={20} />
          </div>
          <h1 className="font-display font-semibold text-lg text-text-primary">Profil ini private</h1>
          <p className="text-sm text-text-secondary">
            Pemilik profil membatasi siapa yang bisa melihat halaman ini.
          </p>
          <Link href="/" className="inline-block text-sm text-purple hover:underline">
            Kembali ke {config.siteName}
          </Link>
        </div>
      </main>
    );
  }

  if (!isOwner) {
    const requestHeaders = await headers();
    // Fire-and-forget: telemetry, must never block or fail the page render.
    recordProfileView(user.id, requestHeaders).catch(() => {});
  }

  const planCheckUser = { plan: user.plan, role: user.role };
  const [removeBranding, accessibleFeatures] = await Promise.all([
    hasFeatureAccess(planCheckUser, "remove_powered_by"),
    getUserFeatures(planCheckUser),
  ]);

  const activeWidgets = resolveActiveWidgets(
    user.widgetConfig as WidgetConfigMap | null,
    accessibleFeatures
  );

  const hasGuestbookWidget = activeWidgets.some((w) => w.key === "guestbook");
  const hasReactionsWidget = activeWidgets.some((w) => w.key === "reactions");
  const rssFeedWidget = activeWidgets.find((w) => w.key === "rss-feed");
  const cryptoTickerWidget = activeWidgets.find((w) => w.key === "crypto-ticker");

  const [discordPresence, guestbookEntries, reactionRows, featuredBadgeRows, rssFeedTitles, cryptoPrices] =
    await Promise.all([
      resolveDiscordPresence({
        discordId: user.discordId,
        discordLinked: user.discordLinked,
        discordPresenceCache: user.discordPresenceCache,
        discordPresenceUpdatedAt: user.discordPresenceUpdatedAt,
      }),
      hasGuestbookWidget
        ? prisma.guestbookEntry.findMany({
            where: { userId: user.id, hidden: false },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { id: true, name: true, message: true, createdAt: true },
          })
        : Promise.resolve([]),
      hasReactionsWidget
        ? prisma.profileReaction.findMany({ where: { userId: user.id } })
        : Promise.resolve([]),
      // docs/11-public-profile.md §5 — Badge Showcase (featured badges saja,
      // bukan seluruh koleksi badge milik user).
      prisma.userBadge.findMany({
        where: { userId: user.id, featured: true, unlockedAt: { not: null } },
        select: { badge: { select: { id: true, name: true, description: true, icon: true, rarity: true } } },
      }),
      // docs/09 §3 — RSS Feed & Crypto Ticker widget, fetch dilakukan di sini
      // (Server Component) karena keduanya butuh panggilan API eksternal;
      // lihat catatan arsitektur di masing-masing file widget.
      (async () => {
        const feedUrl = (rssFeedWidget?.config as { feedUrl?: string } | undefined)?.feedUrl;
        return feedUrl ? fetchFeedTitles(feedUrl) : [];
      })(),
      (async () => {
        const symbols = (cryptoTickerWidget?.config as { symbols?: string[] } | undefined)?.symbols;
        return symbols && symbols.length > 0 ? fetchCryptoPrices(symbols) : {};
      })(),
    ]);

  const reactionCounts: Record<string, number> = {};
  for (const r of reactionRows) reactionCounts[r.emoji] = r.count;

  const totalLinkClicks = user.links.reduce((sum, l) => sum + l.clicks, 0);
  const unlockedBadgesCount = await prisma.userBadge.count({
    where: { userId: user.id, unlockedAt: { not: null } },
  });

  const featuredBadges = featuredBadgeRows.map((row) => row.badge);

  const showDiscordActivity = accessibleFeatures.includes("widget_discord_activity");
  const showSpotify = accessibleFeatures.includes("widget_spotify");
  const theme = getProfileTheme(user.profileTheme, user.profileAccentColor);
  const backgroundConfig = user.profileBackground as ProfileBackgroundConfig | null;
  const backgroundStyle = getBackgroundStyle(backgroundConfig);

  const socialLinks = (user.socialLinks as Record<string, string> | null) ?? {};
  const socials = SOCIAL_PLATFORMS.filter((p) => socialLinks[p.id]).map((p) => ({
    id: p.id,
    label: p.label,
    url: socialLinks[p.id],
  }));

  // Rendered via createElement (not a JSX tag) because the layout is chosen
  // dynamically from user data — this keeps the dynamic-component selection
  // out of JSX-tag position while producing an identical element. The whole
  // thing is wrapped in <ProfileEntryGate>, which is a static/known
  // component, so that one stays a normal JSX tag.
  const layoutElement = createElement(getLayoutComponent(user.profileLayout), {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      bannerImage: user.bannerImage,
      plan: user.plan,
      role: user.role,
      isFounder: user.isFounder,
      discordId: user.discordId,
      profileViews: user.profileViews,
    },
    theme,
    borderStyle: user.profileBorder,
    fontFamily: getProfileFont(user.profileFont).fontFamily,
    backgroundStyle,
    background: {
      type: backgroundConfig?.type ?? "gradient",
      colors: backgroundConfig?.colors,
      mediaUrl: backgroundConfig?.mediaUrl,
    },
    activeWidgets,
    links: user.links.map(({ passwordHash, clicks: _clicks, ...link }) => ({
      ...link,
      hasPassword: Boolean(passwordHash),
    })),
    socials,
    discordPresence,
    showDiscordActivity,
    showSpotify,
    isOwner,
    isViewerAdmin,
    poweredByVisible: !removeBranding && config.poweredByVisible,
    siteName: config.siteName,
    guestbookEntries: guestbookEntries.map((e) => ({
      id: e.id,
      name: e.name,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
    })),
    reactionCounts,
    featuredBadges,
    totalLinkClicks,
    badgesCount: unlockedBadgesCount,
    rssFeedTitles,
    cryptoPrices,
    backgroundAudioUrl: user.backgroundAudioUrl,
  });

  return <ProfileEntryGate>{layoutElement}</ProfileEntryGate>;
}
