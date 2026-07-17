"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Crown,
  Palette,
  Trash2,
  Mail,
  KeyRound,
  Shield,
  Link2,
  BellRing,
  ExternalLink,
  BadgeCheck,
} from "lucide-react";
import { ThemeSettingsPanel } from "@/components/ThemeSwitcher";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { EmailSettingsPanel } from "./EmailSettingsPanel";
import { SecurityPanel } from "./SecurityPanel";
import { DeleteAccountForm } from "./DeleteAccountForm";
import { PremiumSection } from "./PremiumSection";
import { CreditsSection } from "./CreditsSection";
import { TwoFactorSection } from "./TwoFactorSection";
import { TrustedDevicesSection } from "./TrustedDevicesSection";
import { SecurityScoreCard } from "./SecurityScoreCard";
import { ConnectedAccountsPanel } from "./ConnectedAccountsPanel";
import { NotificationPreferencesPanel } from "./NotificationPreferencesPanel";
import type { SecurityScoreResult } from "@/lib/security-score";
import type { TrustedDeviceItem } from "./TrustedDevicesSection";

type Tab = "account" | "premium" | "preferences" | "danger";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Akun & Keamanan", icon: Shield },
  { key: "premium", label: "Premium & Kredit", icon: Crown },
  { key: "preferences", label: "Preferensi", icon: Palette },
  { key: "danger", label: "Zona Bahaya", icon: Trash2 },
];

interface ActiveSessionItem {
  jti: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastUsedAt: string;
  isCurrent: boolean;
}

interface LoginHistoryItem {
  id: string;
  success: boolean;
  method: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  reason: string;
  note: string | null;
  createdAt: string;
}

interface Props {
  username: string | null;
  email: string | null;
  emailVerified: boolean;
  hasExistingPassword: boolean;
  plan: "FREE" | "PREMIUM";
  role: "ADMIN" | "USER";
  premiumSince: string | null;
  premiumExpiresAt: string | null;
  creditsBalance: number;
  creditTransactions: CreditTransaction[];
  twoFactorEnabled: boolean;
  trustedDevices: TrustedDeviceItem[];
  securityScore: SecurityScoreResult;
  activeSessions: ActiveSessionItem[];
  loginHistory: LoginHistoryItem[];
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  connectedProviders: string[];
  notifyGuestbookEmail: boolean;
}

function SubHeader({
  icon: Icon,
  label,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className={tone} />
      <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
    </div>
  );
}

export function SettingsClient({
  username,
  email,
  emailVerified,
  hasExistingPassword,
  plan,
  role,
  premiumSince,
  premiumExpiresAt,
  creditsBalance,
  creditTransactions,
  twoFactorEnabled,
  trustedDevices,
  securityScore,
  activeSessions,
  loginHistory,
  lastLoginAt,
  lastLoginIp,
  connectedProviders,
  notifyGuestbookEmail,
}: Props) {
  const [tab, setTab] = useState<Tab>("account");
  const isPremium = plan !== "FREE";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-5 min-w-0">
        {/* Tab bar */}
        <div className="glass rounded-2xl p-1.5 flex gap-1 flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                tab === key
                  ? "bg-purple/15 text-purple border border-purple/25"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Akun & Keamanan */}
        {tab === "account" && (
          <div className="space-y-6">
            <div>
              <SubHeader icon={Mail} label="Email" tone="text-blue" />
              {email && (
                <EmailSettingsPanel
                  email={email}
                  emailVerified={emailVerified}
                  hasExistingPassword={hasExistingPassword}
                />
              )}
            </div>

            <div>
              <SubHeader icon={KeyRound} label="Password" tone="text-blue" />
              <div className="glass rounded-2xl p-6">
                <PasswordChangeForm hasExistingPassword={hasExistingPassword} />
              </div>
            </div>

            <div>
              <SubHeader icon={ShieldCheck} label="Keamanan — 2FA" tone="text-emerald-300" />
              <TwoFactorSection enabled={twoFactorEnabled} />
              <div className="mt-4">
                <p className="text-xs font-medium text-text-tertiary mb-2">Trusted Devices</p>
                <TrustedDevicesSection devices={trustedDevices} />
              </div>
            </div>

            <div>
              <SubHeader icon={Shield} label="Sesi & Riwayat Login" tone="text-emerald-400" />
              <SecurityPanel
                activeSessions={activeSessions}
                loginHistory={loginHistory}
                lastLoginAt={lastLoginAt}
                lastLoginIp={lastLoginIp}
              />
            </div>

            <div>
              <SubHeader icon={Link2} label="Akun Login Terhubung" tone="text-blue" />
              <ConnectedAccountsPanel providers={connectedProviders} />
            </div>
          </div>
        )}

        {/* Premium & Kredit */}
        {tab === "premium" && (
          <div className="space-y-6">
            <div>
              <SubHeader icon={Crown} label="Premium" tone="text-amber-300" />
              <PremiumSection
                plan={plan}
                role={role}
                premiumSince={premiumSince}
                premiumExpiresAt={premiumExpiresAt}
              />
            </div>

            <div>
              <SubHeader icon={Crown} label="Credits" tone="text-amber-300" />
              <CreditsSection balance={creditsBalance} transactions={creditTransactions} />
            </div>
          </div>
        )}

        {/* Preferensi */}
        {tab === "preferences" && (
          <div className="space-y-6">
            <div>
              <SubHeader icon={Palette} label="Tampilan Dashboard" tone="text-purple" />
              <ThemeSettingsPanel />
            </div>

            <div>
              <SubHeader icon={BellRing} label="Preferensi Notifikasi" tone="text-purple" />
              <NotificationPreferencesPanel initialNotifyGuestbookEmail={notifyGuestbookEmail} />
            </div>
          </div>
        )}

        {/* Zona Bahaya */}
        {tab === "danger" && (
          <div>
            <SubHeader icon={Trash2} label="Hapus Akun" tone="text-red-400" />
            <div className="glass rounded-2xl p-6 border border-red-400/20">
              <DeleteAccountForm hasExistingPassword={hasExistingPassword} />
            </div>
          </div>
        )}
      </div>

      {/* Sticky sidebar — security score + quick facts, always visible regardless of tab */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <SecurityScoreCard result={securityScore} />

        <div className="glass rounded-2xl p-5 space-y-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary">
            Ringkasan Akun
          </p>

          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Plan</dt>
              <dd
                className={`font-medium capitalize flex items-center gap-1 ${
                  isPremium ? "text-amber-300" : "text-text-primary"
                }`}
              >
                {isPremium && <Crown size={11} />}
                {plan.toLowerCase()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Email</dt>
              <dd
                className={`font-medium flex items-center gap-1 ${
                  emailVerified ? "text-emerald-300" : "text-text-tertiary"
                }`}
              >
                {emailVerified && <BadgeCheck size={11} />}
                {emailVerified ? "Terverifikasi" : "Belum diverifikasi"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">2FA</dt>
              <dd
                className={`font-medium ${
                  twoFactorEnabled ? "text-emerald-300" : "text-text-tertiary"
                }`}
              >
                {twoFactorEnabled ? "Aktif" : "Nonaktif"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Credits</dt>
              <dd className="text-text-primary font-medium">{creditsBalance}</dd>
            </div>
          </dl>

          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
            >
              Buka Profil Publik
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
