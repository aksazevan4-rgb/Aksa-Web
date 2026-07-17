import { Lock } from "lucide-react";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { getCardBorderVars } from "@/lib/profile-themes";
import { ProfileBackgroundFX } from "@/components/profile/ProfileBackgroundFX";
import { LinkIcon } from "@/components/LinkIcon";
import { DiscordWidget } from "@/components/profile/widgets/DiscordWidget";
import { ExtraWidgets } from "@/components/profile/widgets/ExtraWidgets";
import type { ProfileLayoutProps } from "./types";

export function MinimalLayout({
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
  totalLinkClicks = 0,
  badgesCount = 0,
  rssFeedTitles = [],
  cryptoPrices = {},
}: ProfileLayoutProps) {
  const hasWidget = (key: string) => activeWidgets.some((w) => w.key === key);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16" style={{ ...backgroundStyle, ...getCardBorderVars(borderStyle, theme.accentHex), fontFamily, "--font-display": fontFamily, "--font-body": fontFamily } as React.CSSProperties}>
      <ProfileBackgroundFX type={background.type} colors={background.colors} accentHex={theme.accentHex} mediaUrl={background.mediaUrl} />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <ProfileAvatar
            src={user.image}
            name={user.name}
            sizeClassName="h-16 w-16"
            textClassName="text-xl"
            className="border border-border"
            borderStyle={borderStyle}
            accentHex={theme.accentHex}
          />
          <h1 className="mt-4 font-display font-medium text-lg text-text-primary tracking-tight">
            {user.name}
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">@{user.username}</p>

          {hasWidget("about") && user.bio ? (
            <p className="mt-4 text-xs text-text-secondary leading-relaxed max-w-xs">{user.bio}</p>
          ) : null}

          {hasWidget("social") && socials.length > 0 ? (
            <div className="flex items-center gap-4 mt-5">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <LinkIcon icon={s.id} size={16} />
                </a>
              ))}
            </div>
          ) : null}

          {isOwner || isViewerAdmin ? (
            <Link href="/dashboard/profile" className="mt-3 text-[11px] text-text-tertiary hover:text-purple transition-colors">
              {isOwner ? "Edit profil ini" : "Lihat sebagai admin"}
            </Link>
          ) : null}
        </div>

        {hasWidget("discord") && user.discordId && discordPresence ? (
          <div className="mt-8 scale-95 origin-top">
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
          <div className="mt-8 flex flex-col divide-y divide-border">
            {links.map((link) => (
              <a
                key={link.id}
                href={`/l/${link.id}`}
                target={link.openInNewTab === false ? undefined : "_blank"}
                rel={link.openInNewTab === false ? undefined : "noopener noreferrer"}
                className="flex items-center justify-between gap-3 py-3.5 text-sm text-text-secondary hover:text-text-primary transition-colors group"
              >
                <span className="inline-flex items-center gap-1.5" style={link.color ? { color: link.color } : undefined}>
                  {link.label}
                  {link.hasPassword && <Lock size={11} className="opacity-60" />}
                </span>
                <LinkIcon
                  icon={link.icon}
                  size={14}
                  style={link.color ? { color: link.color } : undefined}
                  className="text-text-tertiary group-hover:translate-x-0.5 transition-transform"
                />
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
          className="mt-8"
        
          guestbookEntries={guestbookEntries}
          reactionCounts={reactionCounts}
        />

        {poweredByVisible ? (
          <div className="mt-12 text-center">
            <Link href="/" className="text-[10px] text-text-tertiary hover:text-text-secondary transition-colors">
              Powered by {siteName}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
