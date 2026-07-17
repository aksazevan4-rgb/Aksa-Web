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

export function GlassLayout({
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
    <main
      className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ ...backgroundStyle, ...getCardBorderVars(borderStyle, theme.accentHex), fontFamily, "--font-display": fontFamily, "--font-body": fontFamily } as React.CSSProperties}
    >
      <ProfileBackgroundFX type={background.type} colors={background.colors} accentHex={theme.accentHex} mediaUrl={background.mediaUrl} />
      {/* Ambient orbs */}
      <div
        aria-hidden
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: theme.accentHex }}
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: theme.accentHex }}
      />

      {user.bannerImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.bannerImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 pointer-events-none"
        />
      ) : null}

      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-3xl p-7 sm:p-8 border border-white/10"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex flex-col items-center text-center">
            <ProfileAvatar
              src={user.image}
              name={user.name}
              sizeClassName="h-24 w-24"
              textClassName="text-3xl"
              className="border-2 border-white/20"
              borderStyle={borderStyle}
              accentHex={theme.accentHex}
            />
            <h1 className="mt-4 font-display font-semibold text-xl text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-tertiary">@{user.username}</p>
            <div className="mt-2">
              <PlanBadge user={user} size="md" />
            </div>

            <BadgeShowcase badges={featuredBadges} className="mt-3" />

            {hasWidget("about") && user.bio ? (
              <p className="mt-4 text-sm text-text-secondary leading-relaxed">{user.bio}</p>
            ) : null}

            {hasWidget("social") && socials.length > 0 ? (
              <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="h-9 w-9 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <LinkIcon icon={s.id} size={15} />
                  </a>
                ))}
              </div>
            ) : null}

            {isOwner || isViewerAdmin ? (
              <Link href="/dashboard/profile" className="mt-4 text-xs text-purple hover:underline">
                {isOwner ? "Edit profil ini" : "Lihat sebagai admin"}
              </Link>
            ) : null}
          </div>

          {hasWidget("discord") && user.discordId && discordPresence ? (
            <div className="mt-6">
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
            <div className="mt-7 space-y-2.5">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={`/l/${link.id}`}
                  target={link.openInNewTab === false ? undefined : "_blank"}
                  rel={link.openInNewTab === false ? undefined : "noopener noreferrer"}
                  style={link.color ? { borderColor: link.color } : undefined}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 px-5 py-3.5 text-sm font-medium text-text-primary transition-colors profile-link-btn"
                >
                  <LinkIcon icon={link.icon} size={17} style={{ color: link.color ?? theme.accentHex }} />
                  <span className="flex-1 text-center">{link.label}</span>
                  {link.hasPassword && <Lock size={13} className="opacity-60 flex-shrink-0" />}
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
            className="mt-7"
          
          guestbookEntries={guestbookEntries}
          reactionCounts={reactionCounts}
        />
        </div>

        {poweredByVisible ? (
          <div className="mt-6 text-center">
            <Link href="/" className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors">
              Powered by {siteName}
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
