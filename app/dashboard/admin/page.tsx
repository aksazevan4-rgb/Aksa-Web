import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Crown,
  FileText,
  Flag,
  HardDrive,
  Settings,
  Shield,
  ShieldQuestion,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";
import { getSiteConfig } from "@/lib/site-config";

export default async function AdminDashboardPage() {
  await verifyAdmin();

  const [userCount, messageCount, auditCount, premiumCount, pendingModerationCount, activeFlagCount, totalFlagCount, config] =
    await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.auditLog.count(),
      prisma.user.count({ where: { plan: "PREMIUM" } }),
      prisma.profileTemplate.count({ where: { visibility: "PUBLIC", pendingReview: true } }),
      prisma.featureFlag.count({ where: { enabled: true } }),
      prisma.featureFlag.count(),
      getSiteConfig(),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      plan: true,
      isFounder: true,
      createdAt: true,
    },
  });

  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      action: true,
      entityType: true,
      createdAt: true,
      actor: { select: { name: true, email: true } },
    },
  });

  const stats = [
    {
      label: "Total User",
      value: userCount,
      icon: Users,
      color: "text-blue",
      bg: "bg-blue/10 border-blue/20",
      href: "/dashboard/admin/users",
    },
    {
      label: "User Premium",
      value: premiumCount,
      icon: Sparkles,
      color: "text-amber-300",
      bg: "bg-amber-400/10 border-amber-400/20",
      href: "/dashboard/admin/premium",
    },
    {
      label: "Pesan Masuk",
      value: messageCount,
      icon: FileText,
      color: "text-purple",
      bg: "bg-purple/10 border-purple/20",
      href: "/dashboard/admin/content",
    },
    {
      label: "Activity Log",
      value: auditCount,
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
      href: "/dashboard/admin/logs",
    },
    {
      label: "Moderasi Tertunda",
      value: pendingModerationCount,
      icon: ShieldQuestion,
      color: "text-red-400",
      bg: "bg-red-400/10 border-red-400/20",
      href: "/dashboard/admin/moderation",
    },
    {
      label: "Feature Flags Aktif",
      value: activeFlagCount,
      icon: Flag,
      color: "text-blue",
      bg: "bg-blue/10 border-blue/20",
      href: "/dashboard/admin/feature-flags",
    },
  ];

  const shortcuts = [
    { label: "Kelola User", href: "/dashboard/admin/users", icon: Users },
    { label: "Premium & Paket", href: "/dashboard/admin/premium", icon: Crown },
    { label: "Analytics Platform", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Konten Website", href: "/dashboard/admin/content", icon: FileText },
    { label: "Konfigurasi Global", href: "/dashboard/admin/config", icon: Settings },
    { label: "Activity Log", href: "/dashboard/admin/logs", icon: Activity },
    { label: "Media Manager", href: "/dashboard/admin/content/media", icon: HardDrive },
    { label: "Showcase", href: "/dashboard/admin/showcase", icon: Sparkles },
    { label: "Feature Flags", href: "/dashboard/admin/feature-flags", icon: Flag },
    { label: "Moderasi Marketplace", href: "/dashboard/admin/moderation", icon: ShieldQuestion },
    { label: "Status Sistem", href: "/dashboard/admin/status", icon: Timer },
  ];

  const premiumRate = userCount > 0 ? Math.round((premiumCount / userCount) * 100) : 0;

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Panel Admin
          </h1>
          <p className="text-sm text-text-secondary">
            Kelola platform {config.siteName} — user, premium, konten, dan konfigurasi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
              <Link
                key={label}
                href={href}
                className="glass rounded-2xl p-5 hover:border-purple/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${bg} ${color}`}>
                    <Icon size={17} />
                  </div>
                  <ArrowRight size={14} className="text-text-tertiary group-hover:text-purple transition-colors" />
                </div>
                <p className="text-2xl font-display font-bold text-text-primary tabular-nums">
                  {value.toLocaleString("id-ID")}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{label}</p>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent users */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">User Terbaru</h2>
                <Link href="/dashboard/admin/users" className="text-xs text-purple hover:underline">
                  Lihat semua →
                </Link>
              </div>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">Belum ada user</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <UserAvatar src={u.image} name={u.name} email={u.email} sizeClassName="h-8 w-8" textClassName="text-xs" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary truncate">{u.name ?? u.email}</p>
                        <p className="text-xs text-text-tertiary truncate">
                          {new Date(u.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <PlanBadge user={u} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Aktivitas Terbaru</h2>
                <Link href="/dashboard/admin/logs" className="text-xs text-purple hover:underline">
                  Lihat semua →
                </Link>
              </div>
              {recentLogs.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">Belum ada aktivitas</p>
              ) : (
                <div className="space-y-3">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Activity size={11} className="text-purple" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-text-primary">
                          <span className="font-medium">{log.actor?.name ?? "System"}</span>{" "}
                          <span className="font-mono text-purple">{log.action}</span>{" "}
                          <span className="text-text-secondary">{log.entityType}</span>
                        </p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">
                          {new Date(log.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shortcuts grid */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Kelola Platform</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shortcuts.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 border border-border hover:border-purple/30 hover:bg-purple/5 transition-all text-center group"
                >
                  <Icon size={20} className="text-text-tertiary group-hover:text-purple transition-colors" />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky sidebar — ringkasan platform sekilas */}
        <div className="xl:sticky xl:top-24 space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary">
              Ringkasan Platform
            </p>

            {/* Status situs */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Status Situs</span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full border ${
                  config.maintenanceMode
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/25"
                    : "bg-emerald-400/10 text-emerald-300 border-emerald-400/25"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    config.maintenanceMode ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {config.maintenanceMode ? "Maintenance" : "Online"}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-tertiary">Konversi Premium</span>
                <span className="text-xs font-semibold text-amber-300">{premiumRate}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${premiumRate}%` }}
                />
              </div>
            </div>

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Nama Situs</dt>
                <dd className="text-text-primary font-medium truncate max-w-[140px]">{config.siteName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Total User</dt>
                <dd className="text-text-primary font-medium tabular-nums">{userCount.toLocaleString("id-ID")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">User Premium</dt>
                <dd className="text-amber-300 font-medium tabular-nums">{premiumCount.toLocaleString("id-ID")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Activity Log</dt>
                <dd className="text-text-primary font-medium tabular-nums">{auditCount.toLocaleString("id-ID")}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Feature Flags</dt>
                <dd className="text-text-primary font-medium tabular-nums">
                  {activeFlagCount} / {totalFlagCount} aktif
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-tertiary">Moderasi Tertunda</dt>
                <dd
                  className={`font-medium tabular-nums ${
                    pendingModerationCount > 0 ? "text-red-400" : "text-text-primary"
                  }`}
                >
                  {pendingModerationCount}
                </dd>
              </div>
            </dl>

            <Link
              href="/dashboard/admin/status"
              className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
            >
              Cek Status Sistem
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
