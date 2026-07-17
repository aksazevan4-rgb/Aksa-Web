import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { hasPremiumAccess } from "@/lib/premium";
import { getLinkLimit } from "@/lib/premium-features";
import { getSiteConfig } from "@/lib/site-config";
import ProfileLinksClient from "./ProfileLinksClient";

export default async function ProfileLinksPage() {
  const session = await verifySession();

  const [dbUser, config] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        plan: true,
        username: true,
        links: {
          orderBy: { order: "asc" },
        },
      },
    }),
    getSiteConfig(),
  ]);

  const linkLimit = dbUser
    ? await getLinkLimit({ plan: dbUser.plan, role: dbUser.role })
    : 5;

  return (
    <ProfileLinksClient
      links={dbUser?.links ?? []}
      username={dbUser?.username ?? null}
      isPremium={dbUser ? hasPremiumAccess(dbUser) : false}
      linkLimit={linkLimit === Infinity ? null : linkLimit}
      siteUrl={config.siteUrl}
    />
  );
}
