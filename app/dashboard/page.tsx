import Link from "next/link";
import { signOut } from "@/lib/auth";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowUpRight,
  Crown,
  ExternalLink,
  FileText,
  Globe2,
  Link2,
  LogOut,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";
import { getSiteConfig } from "@/lib/site-config";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { ProfileCompletionCard, type CompletionItem } from "@/components/dashboard/ProfileCompletionCard";

export default async function DashboardPage() {
  // verifySession() cukup di sini — halaman ini adalah landing dashboard
  // untuk SEMUA user yang login (USER maupun ADMIN), bukan halaman
  // khusus admin. Konten yang memang khusus admin ditandai kondisional
  // di bawah, bukan menggerbang seluruh halaman di belakang verifyAdmin().
  const session = await verifySession();
  const user = session.user;
  const isAdmin = user.role === "ADMIN";

  const [dbUser, config] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        bio: true,
        image: true,
        profileTheme: true,
        profileViews: true,
        links: { select: { clicks: true } },
      },
    }),
    getSiteConfig(),
  ]);

  const totalClicks =
    (dbUser?.links ?? []).reduce((sum, l) => sum + l.clicks, 0) ?? 0;
  const linkCount = (dbUser?.links ?? []).length ?? 0;

  // Derive public profile origin from configured site URL, not hardcoded.
  const profileHost = config.siteUrl.replace(/^https?:\/\//, "");
  const publicUrl = dbUser?.username ? `${profileHost}/${dbUser.username}` : null;

  const completionItems: CompletionItem[] = [
    { label: "Setel username", done: !!dbUser?.username, href: "/dashboard/profile" },
    { label: "Tulis bio singkat", done: !!dbUser?.bio, href: "/dashboard/profile" },
    { label: "Upload foto profil", done: !!(dbUser?.image ?? user.image), href: "/dashboard/profile" },
    { label: "Tambah minimal 1 link", done: linkCount > 0, href: "/dashboard/profile/links" },
    { label: "Kustomisasi tampilan", done: !!dbUser?.profileTheme, href: "/dashboard/profile/appearance" },
  ];

  const quickActions = [
    {
      href: "/dashboard/profile",
      icon: User,
      title: "Profil Saya",
      desc: "Nama, bio, foto, visibilitas",
      tone: "purple" as const,
    },
    {
      href: "/dashboard/profile/appearance",
      icon: Globe2,
      title: "Tampilan",
      desc: "Layout, background, widget",
      tone: "purple" as const,
    },
    {
      href: "/dashboard/profile/links",
      icon: Link2,
      title: "Link Manager",
      desc: "Kelola link di profilmu",
      tone: "blue" as const,
    },
    publicUrl
      ? {
          href: `/${dbUser?.username}`,
          icon: ExternalLink,
          title: "Lihat Profil Publik",
          desc: publicUrl,
          tone: "emerald" as const,
          external: true,
        }
      : {
          href: "/dashboard/profile",
          icon: ExternalLink,
          title: "Aktifkan Profil Publik",
          desc: "Setel username dulu",
          tone: "amber" as const,
        },
  ];

  const toneStyles = {
    purple: { chip: "bg-purple/10 border-purple/20 text-purple", ring: "hover:border-purple/40" },
    blue: { chip: "bg-blue/10 border-blue/20 text-blue", ring: "hover:border-blue/40" },
    emerald: { chip: "bg-emerald-400/10 border-emerald-400/20 text-emerald-300", ring: "hover:border-emerald-400/40" },
    amber: { chip: "bg-amber-400/10 border-amber-400/20 text-amber-300", ring: "hover:border-amber-400/40" },
  } as const;

  return (
    <main className="max-w-7xl mx-auto space-y-6">
      {/* Hero identity card — the one place we spend the "signature" aurora ring */}
      <div className="dash-aurora-ring rounded-3xl">
        <div className="dash-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple/15 blur-[90px] pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue/10 blur-[90px] pointer-events-none"
          />
          <UserAvatar
            src={user.image}
            name={user.name}
            email={user.email}
            sizeClassName="h-16 w-16 sm:h-20 sm:w-20"
            textClassName="text-2xl"
            className="border border-purple/30 relative z-10 shrink-0"
          />
          <div className="flex-1 relative z-10 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-semibold text-xl sm:text-2xl text-gradient-neon">
                Halo, {user.name ?? user.email}
              </h1>
              <PlanBadge user={user} size="md" />
            </div>
            <p className="text-text-secondary text-sm mt-1">{user.email}</p>
          </div>
          {publicUrl && (
            <Link
              href={`/${dbUser?.username}`}
              target="_blank"
              className="relative z-10 inline-flex items-center gap-2 rounded-full bg-purple/10 border border-purple/25 px-4 py-2.5 text-sm font-medium text-purple hover:bg-purple/20 transition-colors shrink-0 self-start sm:self-center"
            >
              <ExternalLink size={14} />
              <span className="truncate max-w-[160px]">{publicUrl}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main column */}
        <div className="space-y-6 min-w-0">
          {/* Stats — animated count-up on mount */}
          <DashboardStatsGrid
            profileViews={dbUser?.profileViews ?? 0}
            totalClicks={totalClicks}
            linkCount={linkCount}
          />

          {/* Quick actions */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary mb-2 px-1">
              Kelola Profil
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const style = toneStyles[action.tone];
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    target={"external" in action && action.external ? "_blank" : undefined}
                    className={`dash-panel group rounded-2xl p-5 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200 ${style.ring}`}
                  >
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${style.chip}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{action.title}</p>
                      <p className="text-xs text-text-tertiary truncate">{action.desc}</p>
                    </div>
                    <ArrowUpRight size={15} className="text-text-tertiary group-hover:text-text-primary transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {!isAdmin && user.plan !== "PREMIUM" && (
            <Link
              href="/dashboard/settings#premium"
              className="dash-panel block rounded-2xl p-5 relative overflow-hidden group hover:border-purple/30 transition-colors"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(155,109,255,0.1), rgba(79,158,255,0.05))",
              }}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-11 w-11 rounded-xl bg-purple/15 border border-purple/25 flex items-center justify-center text-purple flex-shrink-0">
                  <Crown size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    Upgrade ke Premium
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Link tanpa batas, layout eksklusif, Discord activity, dan lebih banyak lagi.
                  </p>
                </div>
                <ExternalLink size={15} className="text-text-tertiary group-hover:text-purple transition-colors flex-shrink-0" />
              </div>
            </Link>
          )}

          {isAdmin && (
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary mb-2 px-1">
                Admin
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                  href="/dashboard/admin/users"
                  className="dash-panel rounded-2xl p-4 flex items-center gap-3 hover:border-purple/40 transition-colors"
                >
                  <Users size={17} className="text-purple shrink-0" />
                  <span className="text-sm text-text-primary">Kelola User</span>
                </Link>
                <Link
                  href="/dashboard/admin/premium"
                  className="dash-panel rounded-2xl p-4 flex items-center gap-3 hover:border-purple/40 transition-colors"
                >
                  <Crown size={17} className="text-amber-300 shrink-0" />
                  <span className="text-sm text-text-primary">Premium & Paket</span>
                </Link>
                <Link
                  href="/dashboard/admin/content"
                  className="dash-panel rounded-2xl p-4 flex items-center gap-3 hover:border-purple/40 transition-colors"
                >
                  <FileText size={17} className="text-blue shrink-0" />
                  <span className="text-sm text-text-primary">Konten Website</span>
                </Link>
                <Link
                  href="/dashboard/admin/logs"
                  className="dash-panel rounded-2xl p-4 flex items-center gap-3 hover:border-purple/40 transition-colors"
                >
                  <Activity size={17} className="text-emerald-400 shrink-0" />
                  <span className="text-sm text-text-primary">Activity Log</span>
                </Link>
              </div>
            </div>
          )}

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full dash-panel px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-purple/40 transition-colors"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </form>
        </div>

        {/* Side rail */}
        <div className="space-y-6 min-w-0">
          <ProfileCompletionCard items={completionItems} />

          {publicUrl && (
            <div className="dash-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Sparkles size={15} className="text-purple" />
                Preview Profil
              </div>
              <div className="rounded-xl border border-border/70 bg-black/15 p-4 flex items-center gap-3">
                <UserAvatar
                  src={dbUser?.image ?? user.image}
                  name={user.name}
                  email={user.email}
                  sizeClassName="h-11 w-11"
                  textClassName="text-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.name ?? dbUser?.username}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    @{dbUser?.username}
                  </p>
                </div>
              </div>
              <Link
                href={`/${dbUser?.username}`}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
              >
                Buka Profil Publik
                <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
