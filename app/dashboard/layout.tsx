import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/Topbar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { SidebarCollapseProvider } from "@/components/dashboard/SidebarCollapseContext";
import { DashboardContentWrapper } from "@/components/dashboard/DashboardContentWrapper";
import { getSiteConfig } from "@/lib/site-config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const user = session.user;

  const [unreadMessages, config, onboarding, notifications] = await Promise.all([
    user.role === "ADMIN"
      ? prisma.message.findMany({
          where: { read: false },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, name: true, subject: true, createdAt: true },
        })
      : Promise.resolve([]),
    getSiteConfig(),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true, username: true },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // First login / never finished the onboarding picker — send there first.
  // Checked here (not in the picker page alone) so it also catches direct
  // navigation to any /dashboard/* URL, not just the dashboard root.
  if (!onboarding?.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex bg-bg relative overflow-hidden">
      {/* Ambient glow — memberi "sesuatu" untuk di-blur oleh sidebar glass
          (docs/01-design-system.md §6.3 glassmorphism), bukan sekadar
          menumpuk blur di atas warna polos. Fixed + pointer-events-none,
          tidak mengganggu interaksi/scroll konten. */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-purple/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-1/3 left-1/4 h-[420px] w-[420px] rounded-full bg-pink-500/15 blur-[120px]"
      />

      <SidebarCollapseProvider>
        <DashboardSidebar
          role={user.role}
          siteName={config.siteName}
          integrationLinks={[
            { key: "discord", label: "Discord", url: config.socialDiscord ?? null },
            { key: "youtube", label: "YouTube", url: config.socialYoutube ?? null },
            { key: "github", label: "GitHub", url: config.socialGithub ?? null },
          ]}
        />

        <DashboardContentWrapper>
          <DashboardTopbar
            user={user}
            siteName={config.siteName}
            unreadMessages={unreadMessages.map((m: (typeof unreadMessages)[number]) => ({
              id: m.id,
              name: m.name,
              subject: m.subject,
              createdAt: m.createdAt.toISOString(),
            }))}
            notifications={notifications.map((n) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              body: n.body,
              link: n.link,
              read: n.read,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
          <main className="flex-1 p-4 sm:p-5 md:p-8 mt-16">{children}</main>
        </DashboardContentWrapper>
      </SidebarCollapseProvider>

      <CommandPalette isAdmin={user.role === "ADMIN"} username={onboarding?.username ?? null} />
    </div>
  );
}
