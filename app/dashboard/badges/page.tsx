import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/site-config";
import { getEarnedBadgeKeys } from "@/lib/badges";
import { badgeService } from "@/features/badges/server/service";
import type { UserBadgeWithBadge } from "@/features/badges/types";
import { BadgesGrid } from "./BadgesGrid";

export default async function BadgesPage() {
  const session = await verifySession();

  const [dbUser, catalog, owned, config] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        plan: true,
        role: true,
        username: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
    badgeService.listAll(),
    badgeService.listForUser(session.user.id),
    getSiteConfig(),
  ]);

  const earnedKeys = dbUser ? await getEarnedBadgeKeys(dbUser) : new Set<string>();
  const ownedByBadgeId = new Map(owned.map((ub) => [ub.badgeId, ub]));

  // Merge the full catalog with what this user actually owns (UserBadge
  // rows). Badges without a stored row but whose key matches a live
  // "auto-earned" rule (see lib/badges.ts — plan/account-age based) are
  // shown as unlocked too, just without equip/feature controls, since
  // there's no real UserBadge row for the service actions to operate on.
  const userBadges: UserBadgeWithBadge[] = catalog.map((badge) => {
    const existing = ownedByBadgeId.get(badge.id);
    if (existing) return existing;

    const autoUnlocked = earnedKeys.has(badge.key);
    return {
      id: `virtual:${badge.id}`,
      userId: session.user.id,
      badgeId: badge.id,
      progress: autoUnlocked ? 100 : 0,
      unlockedAt: autoUnlocked ? badge.createdAt : null,
      equipped: false,
      featured: false,
      acquiredVia: "SYSTEM",
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
      badge,
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-semibold text-xl text-text-primary">Badges</h1>
        <p className="text-sm text-text-secondary mt-1">
          Koleksi pencapaian yang bisa kamu dapatkan di platform ini.
        </p>
      </div>

      <BadgesGrid userBadges={userBadges} discordUrl={config.socialDiscord} />

      {userBadges.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-text-secondary">
            Katalog badge belum di-seed. Buat badge dulu lewat Admin &gt; Badges.
          </p>
        </div>
      )}
    </div>
  );
}
