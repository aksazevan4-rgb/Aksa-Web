import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { hasFeatureAccess } from "@/lib/premium-features";
import { BarChart3, Crown } from "lucide-react";
import Link from "next/link";
import { AnalyticsClient } from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await verifySession();

  const [dbUser, hasAdvanced] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        plan: true,
        username: true,
        profileViews: true,
        links: {
          select: {
            id: true,
            label: true,
            url: true,
            icon: true,
            clicks: true,
            visible: true,
            createdAt: true,
          },
          orderBy: { clicks: "desc" },
        },
      },
    }),
    hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      "analytics_advanced"
    ),
  ]);

  const totalClicks = (dbUser?.links ?? []).reduce((s, l) => s + l.clicks, 0);

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <BarChart3 size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">Analitik</h1>
          <p className="text-sm text-text-tertiary">Performa profil dan link kamu.</p>
        </div>
      </div>

      <AnalyticsClient
        profileViews={dbUser?.profileViews ?? 0}
        totalClicks={totalClicks}
        links={dbUser?.links ?? []}
        hasAdvanced={hasAdvanced}
      />

      {!hasAdvanced && (
        <Link
          href="/dashboard/settings#premium"
          className="block glass rounded-2xl p-5 relative overflow-hidden group hover:border-purple/30 transition-colors"
          style={{ background: "linear-gradient(135deg, rgba(155,109,255,0.07), rgba(79,158,255,0.04))" }}
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple/15 border border-purple/25 flex items-center justify-center text-purple">
              <Crown size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Analitik Lanjutan (Premium)
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">
                Grafik harian, traffic sumber, dan data lengkap per link.
              </p>
            </div>
          </div>
        </Link>
      )}
    </main>
  );
}
