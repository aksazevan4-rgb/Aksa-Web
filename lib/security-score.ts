/**
 * lib/security-score.ts
 * docs/05-auth-system.md §5 — skor komposit 0-100, murni edukatif (TIDAK
 * dipakai sebagai gate fitur, sesuai catatan eksplisit di dokumen itu).
 * Fungsi murni supaya bisa diuji langsung tanpa DB (docs/17 §2).
 */

export interface SecurityScoreInput {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  hasPassword: boolean;
  passwordUpdatedAt: Date | null;
  oauthAccountsCount: number;
  recentFailedLogins: number;
  recoveryCodesRemaining: number;
}

export interface SecurityScoreFactor {
  key: string;
  label: string;
  weight: number;
  met: boolean;
}

export interface SecurityScoreResult {
  score: number;
  factors: SecurityScoreFactor[];
}

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

/** Dipisah dari computeSecurityScore supaya pemanggil (Server Component
 * app/dashboard/settings/page.tsx) tidak memanggil `Date.now()` langsung
 * di badan komponennya sendiri — ESLint react-hooks/purity menandai itu
 * sebagai impure call, meski secara teknis aman di Server Component. */
export function countRecentFailedLogins(
  events: { success: boolean; createdAt: Date }[],
  windowMs = 1000 * 60 * 60 * 24
): number {
  const now = Date.now();
  return events.filter((e) => !e.success && now - e.createdAt.getTime() < windowMs).length;
}

export function computeSecurityScore(input: SecurityScoreInput): SecurityScoreResult {
  const passwordFresh = input.passwordUpdatedAt
    ? Date.now() - input.passwordUpdatedAt.getTime() < SIX_MONTHS_MS
    : !input.hasPassword; // OAuth-only (tidak pakai password) — tidak ada password basi untuk dikhawatirkan

  const factors: SecurityScoreFactor[] = [
    { key: "twoFactor", label: "2FA aktif", weight: 30, met: input.twoFactorEnabled },
    { key: "passwordFresh", label: "Password diganti dalam 6 bulan terakhir", weight: 15, met: passwordFresh },
    { key: "emailVerified", label: "Email terverifikasi", weight: 15, met: input.emailVerified },
    {
      key: "noSuspiciousSessions",
      label: "Tidak ada percobaan login gagal mencurigakan baru-baru ini",
      weight: 20,
      met: input.recentFailedLogins === 0,
    },
    { key: "oauthLinked", label: "OAuth terhubung", weight: 10, met: input.oauthAccountsCount > 0 },
    {
      key: "recoveryCodes",
      label: "Recovery codes belum habis",
      weight: 10,
      // Tidak relevan kalau 2FA belum aktif — dianggap terpenuhi supaya
      // tidak menghukum user yang memang belum pakai 2FA untuk faktor ini.
      met: !input.twoFactorEnabled || input.recoveryCodesRemaining > 0,
    },
  ];

  const score = factors.reduce((sum, f) => sum + (f.met ? f.weight : 0), 0);

  return { score, factors };
}
