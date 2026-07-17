import { prisma } from "@/lib/prisma";

interface UserForBadges {
  id: string;
  plan: string;
  role: string;
  username: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

const OG_RANK_THRESHOLD = 1000;
const MILLION_USER_THRESHOLD = 1_000_000;

export async function getEarnedBadgeKeys(user: UserForBadges): Promise<Set<string>> {
  const earned = new Set<string>();

  // Premium — live from current plan, not persisted (so it disappears the
  // moment a subscription lapses, same as every other premium gate here).
  if (user.plan === "PREMIUM" || user.role === "ADMIN") {
    earned.add("premium");
  }

  // Verified — email confirmed + username chosen.
  if (user.emailVerified && user.username) {
    earned.add("verified");
  }

  // OG — among the first 1,000 accounts ever created.
  const olderCount = await prisma.user.count({
    where: { createdAt: { lt: user.createdAt } },
  });
  if (olderCount < OG_RANK_THRESHOLD) {
    earned.add("og");
  }

  // The Million — platform-wide celebration badge once total users cross
  // the threshold; everyone registered by then keeps it.
  const totalUsers = await prisma.user.count();
  if (totalUsers >= MILLION_USER_THRESHOLD) {
    earned.add("the_million");
  }

  // Admin/purchase/link badges — manually awarded, stored in UserBadge.
  const manual = await prisma.userBadge.findMany({
    where: { userId: user.id },
    select: { badge: { select: { key: true } } },
  });
  for (const m of manual) earned.add(m.badge.key);

  return earned;
}
