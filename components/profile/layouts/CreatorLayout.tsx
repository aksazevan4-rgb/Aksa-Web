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
 * components/profile/layouts/CreatorLayout.tsx
 *
 * Structural signature: asymmetric header — avatar sits bottom-left,
 * overlapping the banner, with name/bio/actions running alongside it on
 * the right rather than centered underneath. Reads more like a creator's
 * channel page than a business card. Links render as a horizontal pill
 * row instead of a vertical stack, freeing vertical space for widgets.
 */
export function CreatorLayout({
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
    <main className="min-h-screen bg-bg" style={{ ...backgroundStyle, ...getCardBorderVars(borderStyle, theme.accentHex), fontFamily, "--font-display": fontFamily, "--font-body": fontFamily } as React.CSSProperties}>
      <ProfileBackgroundFX type={background.type} colors={background.colors} accentHex={theme.accentHex} mediaUrl={background.mediaUrl} />
      <div className={`relative h-40 sm:h-52 w-full bg-gradient-to-br ${theme.bannerClass}`}>
        {user.bannerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-85" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/10" />
      </div>

      <div className="max-w-xl mx-auto px-5 pb-16">
        <div className="flex items-end gap-4 -mt-10">
          <ProfileAvatar
            src={user.image}
            name={user.name}
            sizeClassName="h-20 w-20"
            textClassName="text-2xl"
            className="border-4 border-bg shadow-xl flex-shrink-0"
            borderStyle={borderStyle}
            accentHex={theme.accentHex}
          />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-lg text-text-primary truncate">{user.name}</h1>
              <PlanBadge user={user} size="sm" />
            </div>
            <p className="text-xs text-text-tertiary truncate">@{user.username}</p>
          </div>

          <BadgeShowcase badges={featuredBadges} className="mt-2" />
          {(isOwner || isViewerAdmin) && (
            <Link
              href="/dashboard/profile"
              className="ml-auto mb-1 text-xs text-purple hover:underline whitespace-nowrap flex-shrink-0"
            >
              {isOwner ? "Edit" : "Admin"}
            </Link>
          )}
        </div>

        {hasWidget("about") && user.bio ? (
          <p className="mt-4 text-sm text-text-secondary leading-relaxed">{user.bio}</p>
        ) : null}

        {hasWidget("social") && socials.length > 0 ? (
          <div className="flex items-center gap-2.5 mt-4 flex-wrap">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="h-8 w-8 rounded-lg bg-white/5 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-purple/40 transition-colors"
              >
                <LinkIcon icon={s.id} size={14} />
              </a>
            ))}
          </div>
        ) : null}

        {hasWidget("discord") && user.discordId && discordPresence ? (
          <div className="mt-5">
            <DiscordWidget
              discordId={user.discordId}
              initialPresence={discordPresence}
              showActivity={showDiscordActivity}
              showSpotify={showSpotify}
              accentHex={theme.accentHex}
            />
          </div>
        ) : null}

        {hasWidget("links") && links.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={`/l/${link.id}`}
                target={link.openInNewTab === false ? undefined : "_blank"}
                rel={link.openInNewTab === false ? undefined : "noopener noreferrer"}
                style={link.color ? { borderColor: link.color } : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium text-text-primary transition-colors profile-link-btn ${theme.buttonClass}`}
              >
                <LinkIcon icon={link.icon} size={13} style={{ color: link.color ?? theme.accentHex }} />
                {link.label}
                {link.hasPassword && <Lock size={11} className="opacity-60" />}
              </a>
            ))}
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
          className="mt-6"
        
          guestbookEntries={guestbookEntries}
          reactionCounts={reactionCounts}
        />

        {poweredByVisible ? (
          <div className="mt-10 text-center">
            <Link href="/" className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors">
              Powered by {siteName}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
