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
 * components/profile/layouts/CompactLayout.tsx
 *
 * Structural signature: everything shrunk and pulled tight — small avatar
 * inline with name instead of stacked above it, single-line link rows with
 * no internal padding waste. Built for profiles with a lot of links where
 * scrolling distance matters more than breathing room.
 */
export function CompactLayout({
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
    <main className="min-h-screen px-4 py-10" style={{ ...backgroundStyle, ...getCardBorderVars(borderStyle, theme.accentHex), fontFamily, "--font-display": fontFamily, "--font-body": fontFamily } as React.CSSProperties}>
      <ProfileBackgroundFX type={background.type} colors={background.colors} accentHex={theme.accentHex} mediaUrl={background.mediaUrl} />
      <div className="max-w-[380px] mx-auto">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            src={user.image}
            name={user.name}
            sizeClassName="h-12 w-12"
            textClassName="text-base"
            className="border border-border flex-shrink-0"
            borderStyle={borderStyle}
            accentHex={theme.accentHex}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-semibold text-sm text-text-primary truncate">{user.name}</h1>
              <PlanBadge user={user} size="sm" />
            </div>
            <p className="text-xs text-text-tertiary truncate">@{user.username}</p>
          </div>

          <BadgeShowcase badges={featuredBadges} className="mt-2" />
          {hasWidget("social") && socials.length > 0 ? (
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              {socials.slice(0, 4).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <LinkIcon icon={s.id} size={14} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {hasWidget("about") && user.bio ? (
          <p className="mt-3 text-xs text-text-secondary leading-relaxed">{user.bio}</p>
        ) : null}

        {isOwner || isViewerAdmin ? (
          <Link href="/dashboard/profile" className="mt-1.5 inline-block text-[10px] text-purple hover:underline">
            {isOwner ? "Edit profil ini" : "Lihat sebagai admin"}
          </Link>
        ) : null}

        {hasWidget("discord") && user.discordId && discordPresence ? (
          <div className="mt-4 scale-[0.92] origin-top -mx-2">
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
          <div className="mt-4 flex flex-col gap-1.5">
            {links.map((link) => (
              <a
                key={link.id}
                href={`/l/${link.id}`}
                target={link.openInNewTab === false ? undefined : "_blank"}
                rel={link.openInNewTab === false ? undefined : "noopener noreferrer"}
                style={link.color ? { borderColor: link.color } : undefined}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium text-text-primary transition-colors profile-link-btn ${theme.buttonClass}`}
              >
                <LinkIcon icon={link.icon} size={14} style={{ color: link.color ?? theme.accentHex }} />
                <span className="flex-1 truncate">{link.label}</span>
                {link.hasPassword && <Lock size={11} className="opacity-60 flex-shrink-0" />}
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
          className="mt-4"
        
          guestbookEntries={guestbookEntries}
          reactionCounts={reactionCounts}
        />

        {poweredByVisible ? (
          <div className="mt-8 text-center">
            <Link href="/" className="text-[10px] text-text-tertiary hover:text-text-secondary transition-colors">
              Powered by {siteName}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
