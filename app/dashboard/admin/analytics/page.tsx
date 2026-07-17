import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BarChart3 } from "lucide-react";
import {AdminAnalyticsClient,type StatItem,} from "./AdminAnalyticsClient";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400_000);
}

export default async function AdminAnalyticsPage() {
  await verifyAdmin();

  const [
    totalUsers,
    premiumUsers,
    totalViews,
    totalLinks,
    totalClicks,
    recentUsers,
    topProfiles,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: "PREMIUM" } }),
    prisma.user.aggregate({ _sum: { profileViews: true } }),
    prisma.profileLink.count(),
    prisma.profileLink.aggregate({ _sum: { clicks: true } }),

    // New users in last 30 days
    prisma.user.count({
      where: { createdAt: { gte: daysAgo(30) } },
    }),

    // Top 10 profiles by views
    prisma.user.findMany({
      where: { profileViews: { gt: 0 }, username: { not: null } },
      orderBy: { profileViews: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        plan: true,
        role: true,
        isFounder: true,
        profileViews: true,
        links: { select: { clicks: true } },
      },
    }),
  ]);

  const stats: StatItem[] = [
    {
      label: "Total User",
      value: totalUsers,
      icon: "users",
      color: "text-purple bg-purple/10 border-purple/20",
    },
    {
      label: "User Premium",
      value: premiumUsers,
      icon: "trending-up",
      color: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    },
    {
      label: "Total Profile Views",
      value: totalViews._sum.profileViews ?? 0,
      icon: "globe",
      color: "text-blue bg-blue/10 border-blue/20",
    },
    {
      label: "Total Link Clicks",
      value: totalClicks._sum.clicks ?? 0,
      icon: "mouse-pointer-click",
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      label: "Total Links Dibuat",
      value: totalLinks,
      icon: "bar-chart",
      color: "text-pink-300 bg-pink-400/10 border-pink-400/20",
    },
  ];

  const topProfilesWithClicks = topProfiles.map((p: (typeof topProfiles)[number]) => ({
    id: p.id,
    name: p.name,
    username: p.username,
    image: p.image,
    plan: p.plan,
    role: p.role,
    isFounder: p.isFounder,
    profileViews: p.profileViews,
    totalClicks: p.links.reduce(
      (s: number, l: (typeof p.links)[number]) => s + l.clicks,
      0
    ),
  }));

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Platform Analytics
          </h1>
          <p className="text-sm text-text-tertiary">
            Statistik keseluruhan platform AKSA.
          </p>
        </div>
      </div>

      <AdminAnalyticsClient
        stats={stats}
        recentUsers={recentUsers}
        topProfiles={topProfilesWithClicks}
        premiumRate={totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0}
      />
    </main>
  );
}
