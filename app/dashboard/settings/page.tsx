import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Settings as SettingsIcon } from "lucide-react";
import { listTrustedDevices } from "@/lib/trusted-device";
import { creditsService } from "@/features/premium/server/service";
import { computeSecurityScore, countRecentFailedLogins } from "@/lib/security-score";
import { SettingsClient } from "@/app/dashboard/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await verifySession();
  const userId = session.user.id;

  const [dbUser, activeTokens, loginEvents, accounts, creditTransactions, trustedDevices] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        emailVerified: true,
        password: true,
        passwordUpdatedAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        plan: true,
        premiumSince: true,
        premiumExpiresAt: true,
        role: true,
        notifyGuestbookEmail: true,
        credits: true,
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: true,
      },
    }),
    prisma.activeToken.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastUsedAt: "desc" },
      select: { jti: true, ipAddress: true, userAgent: true, lastUsedAt: true },
    }),
    prisma.loginEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        success: true,
        method: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true },
    }),
    creditsService.listTransactions(userId),
    listTrustedDevices(userId),
  ]);

  const mostRecentJti = activeTokens[0]?.jti;

  const recentFailedLogins = countRecentFailedLogins(loginEvents);
  const recoveryCodesRemaining = ((dbUser?.twoFactorRecoveryCodes as string[] | null) ?? []).length;

  const securityScore = computeSecurityScore({
    twoFactorEnabled: dbUser?.twoFactorEnabled ?? false,
    emailVerified: Boolean(dbUser?.emailVerified),
    hasPassword: Boolean(dbUser?.password),
    passwordUpdatedAt: dbUser?.passwordUpdatedAt ?? null,
    oauthAccountsCount: accounts.length,
    recentFailedLogins,
    recoveryCodesRemaining,
  });

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Pengaturan
          </h1>
          <p className="text-sm text-text-tertiary">
            Kelola akun, keamanan, premium, dan preferensi kamu.
          </p>
        </div>
      </div>

      <SettingsClient
        username={dbUser?.username ?? null}
        email={dbUser?.email ?? null}
        emailVerified={Boolean(dbUser?.emailVerified)}
        hasExistingPassword={Boolean(dbUser?.password)}
        plan={dbUser?.plan ?? "FREE"}
        role={dbUser?.role ?? "USER"}
        premiumSince={dbUser?.premiumSince?.toISOString() ?? null}
        premiumExpiresAt={dbUser?.premiumExpiresAt?.toISOString() ?? null}
        creditsBalance={dbUser?.credits ?? 0}
        creditTransactions={creditTransactions.map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          reason: tx.reason,
          note: tx.note,
          createdAt: tx.createdAt.toISOString(),
        }))}
        twoFactorEnabled={dbUser?.twoFactorEnabled ?? false}
        trustedDevices={trustedDevices.map((d) => ({
          id: d.id,
          userAgent: d.userAgent,
          expiresAt: d.expiresAt.toISOString(),
          lastUsedAt: d.lastUsedAt?.toISOString() ?? null,
          createdAt: d.createdAt.toISOString(),
        }))}
        securityScore={securityScore}
        activeSessions={activeTokens.map((t) => ({
          ...t,
          lastUsedAt: t.lastUsedAt.toISOString(),
          isCurrent: t.jti === mostRecentJti,
        }))}
        loginHistory={loginEvents.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        }))}
        lastLoginAt={dbUser?.lastLoginAt?.toISOString() ?? null}
        lastLoginIp={dbUser?.lastLoginIp ?? null}
        connectedProviders={accounts.map((a) => a.provider)}
        notifyGuestbookEmail={dbUser?.notifyGuestbookEmail ?? false}
      />
    </main>
  );
}
