import { describe, it, expect } from "vitest";
import { computeSecurityScore } from "./security-score";

const BASE_INPUT = {
  twoFactorEnabled: false,
  emailVerified: false,
  hasPassword: true,
  passwordUpdatedAt: null,
  oauthAccountsCount: 0,
  recentFailedLogins: 0,
  recoveryCodesRemaining: 0,
};

describe("computeSecurityScore", () => {
  it("skor rendah kalau hampir semua faktor tidak terpenuhi (kecuali yang otomatis met saat 2FA off)", () => {
    const result = computeSecurityScore({
      ...BASE_INPUT,
      passwordUpdatedAt: new Date("2020-01-01"), // jelas > 6 bulan lalu
    });
    // "noSuspiciousSessions" (recentFailedLogins=0, +20) dan "recoveryCodes"
    // (otomatis met karena twoFactorEnabled=false, +10) — total 30.
    expect(result.score).toBe(30);
  });

  it("skor 100 kalau semua faktor terpenuhi", () => {
    const result = computeSecurityScore({
      twoFactorEnabled: true,
      emailVerified: true,
      hasPassword: true,
      passwordUpdatedAt: new Date(),
      oauthAccountsCount: 1,
      recentFailedLogins: 0,
      recoveryCodesRemaining: 8,
    });
    expect(result.score).toBe(100);
  });

  it("user OAuth-only (tanpa password) tidak dihukum untuk faktor password basi", () => {
    const result = computeSecurityScore({
      ...BASE_INPUT,
      hasPassword: false,
      passwordUpdatedAt: null,
    });
    const passwordFactor = result.factors.find((f) => f.key === "passwordFresh");
    expect(passwordFactor?.met).toBe(true);
  });

  it("faktor recoveryCodes dianggap terpenuhi kalau 2FA belum aktif", () => {
    const result = computeSecurityScore({ ...BASE_INPUT, twoFactorEnabled: false, recoveryCodesRemaining: 0 });
    const recoveryFactor = result.factors.find((f) => f.key === "recoveryCodes");
    expect(recoveryFactor?.met).toBe(true);
  });

  it("faktor recoveryCodes TIDAK terpenuhi kalau 2FA aktif tapi kode sudah habis", () => {
    const result = computeSecurityScore({ ...BASE_INPUT, twoFactorEnabled: true, recoveryCodesRemaining: 0 });
    const recoveryFactor = result.factors.find((f) => f.key === "recoveryCodes");
    expect(recoveryFactor?.met).toBe(false);
  });
});
