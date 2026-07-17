import { Lock } from "lucide-react";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { getCardBorderVars } from "@/lib/profile-themes";
import { ProfileBackgroundFX } from "@/components/profile/ProfileBackgroundFX";
import { PlanBadge } from "@/components/PlanBadge";
import { LinkIcon } from "@/components/LinkIcon";
import { DiscordWidget } from "@/components/profile/widgets/DiscordWidget";
import { ExtraWidgets } from "@/components/profile/widgets/ExtraWidgets";
import { BadgeShowcase } from "@/features/badges/components/BadgeShowcase";
import type { ProfileLayoutProps } from "./types";

/**
 * components/profile/layouts/FullWidthLayout.tsx
 *
 * Structural signature: the only layout in the set that isn't a centered
 * mobile-width card. Desktop gets a two-column shape — identity fixed in a
 * left rail, content (Discord + widgets) scrolling in a wider right column.
 * Collapses to a single stacked column below the md breakpoint, in the same
 * order (identity, then content) rather than a sidebar-over-content jump.
 */
export function FullWidthLayout({
  user,
  theme,
  borderStyle,
  fontFamily,
  backgroundStyle,
  background,
  activeWidgets,
  links,
  socials,
  discordPresence,
  showDiscordActivity,
  showSpotify,
  isOwner,
  isViewerAdmin,
  poweredByVisible,
  siteName,
  guestbookEntries = [],
  reactionCounts = {},
  featuredBadges = [],
  totalLinkClicks = 0,
  badgesCount = 0,
  rssFeedTitles = [],
  cryptoPrices = {},
}: ProfileLayoutProps) {
  const hasWidget = (key: string) => activeWidgets.some((w) => w.key === key);

  return (
    <main className="min-h-screen" style={{ ...backgroundStyle, ...getCardBorderVars(borderStyle, theme.accentHex), fontFamily, "--font-display": fontFamily, "--font-body": fontFamily } as React.CSSProperties}>
      <ProfileBackgroundFX type={background.type} colors={background.colors} accentHex={theme.accentHex} mediaUrl={background.mediaUrl} />
      <div className={`relative h-48 w-full bg-gradient-to-br ${theme.bannerClass}`}>
        {user.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
          {/* Left rail — identity, sticky on desktop */}
          <div className="md:sticky md:top-8 md:self-start -mt-12 md:-mt-16">
            <ProfileAvatar
              src={user.image}
              name={user.name}
              sizeClassName="h-24 w-24"
              textClassName="text-3xl"
              className="border-4 border-bg shadow-xl"
              borderStyle={borderStyle}
              accentHex={theme.accentHex}
            />
            <div className="mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl text-text-primary">{user.name}</h1>
                <PlanBadge user={user} size="md" />
              </div>
              <p className="text-sm text-text-tertiary mt-0.5">@{user.username}</p>
            </div>

            <BadgeShowcase badges={featuredBadges} className="mt-3 justify-start" />

            {hasWidget("about") && user.bio ? (
              <p className="mt-4 text-sm text-text-secondary leading-relaxed">{user.bio}</p>
            ) : null}

            {hasWidget("social") && socials.length > 0 ? (
              <div className="flex items-center gap-2.5 mt-5 flex-wrap">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="h-9 w-9 rounded-xl bg-white/5 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-purple/40 transition-colors"
                  >
                    <LinkIcon icon={s.id} size={15} />
                  </a>
                ))}
              </div>
            ) : null}

            {hasWidget("links") && links.length > 0 ? (
              <div className="mt-6 space-y-2.5">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={`/l/${link.id}`}
                    target={link.openInNewTab === false ? undefined : "_blank"}
                    rel={link.openInNewTab === false ? undefined : "noopener noreferrer"}
                    style={link.color ? { borderColor: link.color } : undefined}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium text-text-primary transition-colors profile-link-btn ${theme.buttonClass}`}
                  >
                    <LinkIcon icon={link.icon} size={16} style={{ color: link.color ?? theme.accentHex }} />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.hasPassword && <Lock size={12} className="opacity-60 flex-shrink-0" />}
                  </a>
                ))}
              </div>
            ) : null}

            {isOwner || isViewerAdmin ? (
              <Link href="/dashboard/profile" className="mt-4 inline-block text-xs text-purple hover:underline">
                {isOwner ? "Edit profil ini" : "Lihat sebagai admin"}
              </Link>
            ) : null}
          </div>

          {/* Right column — Discord + content widgets */}
          <div className="mt-6 md:mt-8 min-w-0">
            {hasWidget("discord") && user.discordId && discordPresence ? (
              <div className="mb-6">
                <DiscordWidget
                  discordId={user.discordId}
                  initialPresence={discordPresence}
                  showActivity={showDiscordActivity}
                  showSpotify={showSpotify}
                  accentHex={theme.accentHex}
                />
              </div>
            ) : null}

            <ExtraWidgets
              activeWidgets={activeWidgets}
              userId={user.id}
              profileViews={user.profileViews}
          totalLinkClicks={totalLinkClicks}
          badgesCount={badgesCount}
          rssFeedTitles={rssFeedTitles}
          cryptoPrices={cryptoPrices}
              accentHex={theme.accentHex}
            
          guestbookEntries={guestbookEntries}
          reactionCounts={reactionCounts}
        />
          </div>
        </div>

        {poweredByVisible ? (
          <div className="mt-12 text-center md:text-left">
            <Link href="/" className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors">
              Powered by {siteName}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
