import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { getUserFeatures } from "@/lib/premium-features";
import { ProfileForm } from "./ProfileForm";
import { AliasManager } from "./AliasManager";
import { MAX_ALIASES_PER_USER } from "@/lib/alias-constants";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await verifySession();
  const userId = session.user.id;

  const [dbUser, config, discordAccount, aliases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        username: true,
        bio: true,
        image: true,
        bannerImage: true,
        socialLinks: true,
        profileVisibility: true,
        profileTheme: true,
        profileAccentColor: true,
        discordId: true,
        discordLinked: true,
        discordUsername: true,
        discordGlobalName: true,
        profileViews: true,
        role: true,
        plan: true,
        links: { select: { clicks: true } },
      },
    }),
    getSiteConfig(),
    prisma.account.findFirst({
      where: { userId, provider: "discord" },
      select: { providerAccountId: true },
    }),
    prisma.profileAlias.findMany({
      where: { userId },
      select: { id: true, alias: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!dbUser) return null;

  const accessibleFeatures = await getUserFeatures({ plan: dbUser.plan, role: dbUser.role });

  const totalClicks = (dbUser.links ?? []).reduce((s, l) => s + l.clicks, 0);
  const linkCount = (dbUser.links ?? []).length;

  // Derive host safely without hardcoding domain.
  const profileHost = config.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <User size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Profil Saya
          </h1>
          <p className="text-sm text-text-tertiary">
            Info dasar, foto, sosial media, dan tampilan profil publikmu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <ProfileForm
            initial={{
              name: dbUser.name ?? "",
              username: dbUser.username,
              bio: dbUser.bio,
              image: dbUser.image,
              bannerImage: dbUser.bannerImage,
              socialLinks: dbUser.socialLinks as Record<string, string> | null,
              profileVisibility: dbUser.profileVisibility,
              profileTheme: dbUser.profileTheme,
              profileAccentColor: dbUser.profileAccentColor,
              discordId: dbUser.discordId,
              discordLinked: dbUser.discordLinked,
              discordOAuthLinked: Boolean(discordAccount),
              discordUsername: dbUser.discordUsername,
              discordGlobalName: dbUser.discordGlobalName,
            }}
            accessibleFeatures={accessibleFeatures}
            stats={{
              profileViews: dbUser.profileViews,
              totalClicks,
              linkCount,
            }}
            profileHost={profileHost}
          />

          <AliasManager
            initialAliases={aliases}
            profileHost={profileHost}
            maxAliases={MAX_ALIASES_PER_USER}
          />
        </div>

        {/* Sticky live preview — mirrors what visitors actually see */}
        <div className="xl:sticky xl:top-24 space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary">
              Preview Profil
            </p>

            <div
              className="rounded-2xl border border-border overflow-hidden"
              style={{
                background: dbUser.bannerImage
                  ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${dbUser.bannerImage}) center/cover`
                  : "linear-gradient(160deg, rgba(155,109,255,0.18), rgba(79,158,255,0.08))",
              }}
            >
              <div className="p-5 pt-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full border-2 border-white/20 bg-surface overflow-hidden shrink-0">
                  {dbUser.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dbUser.image} alt={dbUser.name ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-white/80">
                      {(dbUser.name ?? dbUser.username ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-white drop-shadow-sm truncate max-w-full">
                  {dbUser.name || "Nama Tampilan"}
                </p>
                <p className="text-xs text-white/70 truncate max-w-full">
                  @{dbUser.username ?? "username"}
                </p>
                {dbUser.bio && (
                  <p className="mt-2 text-[11px] text-white/80 line-clamp-3">
                    {dbUser.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/5 border border-border py-2.5">
                <p className="text-sm font-semibold text-text-primary tabular-nums">
                  {dbUser.profileViews.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-text-tertiary">Views</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-border py-2.5">
                <p className="text-sm font-semibold text-text-primary tabular-nums">
                  {totalClicks.toLocaleString("id-ID")}
                </p>
                <p className="text-[10px] text-text-tertiary">Clicks</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-border py-2.5">
                <p className="text-sm font-semibold text-text-primary tabular-nums">
                  {linkCount}
                </p>
                <p className="text-[10px] text-text-tertiary">Link</p>
              </div>
            </div>

            {dbUser.username && (
              <a
                href={`/${dbUser.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
              >
                Buka Profil Publik
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
