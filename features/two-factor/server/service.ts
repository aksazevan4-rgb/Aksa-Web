/**
 * features/two-factor/server/service.ts
 * Business logic 2FA/TOTP. Tidak ada "use server" — testable langsung
 * (docs/17 §2), meski verifikasi terhadap DB (enable/disable) butuh
 * "server-only" karena memanggil Prisma.
 */

import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { revokeAllTrustedDevices } from "@/lib/trusted-device";

export class TwoFactorServiceError extends Error {}

const APP_NAME = "AKSA AboutMe";
const RECOVERY_CODE_COUNT = 10;

function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    randomBytes(5).toString("hex") // 10 karakter hex, mudah diketik ulang
  );
}

export const twoFactorService = {
  /** Langkah 1 — buat secret BARU tapi belum diaktifkan (`twoFactorEnabled`
   * tetap false) sampai user membuktikan bisa generate kode yang benar
   * lewat confirmEnrollment (docs/05 §2: "konfirmasi 1 kode"). */
  async startEnrollment(userId: string, accountLabel: string) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(accountLabel, APP_NAME, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });

    return { qrDataUrl, secret };
  },

  /** Langkah 2 — verifikasi 1 kode, baru betul-betul mengaktifkan 2FA dan
   * menerbitkan Recovery Codes (ditampilkan sekali, sama seperti API key). */
  async confirmEnrollment(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) {
      throw new TwoFactorServiceError("Belum ada proses enrollment 2FA yang berjalan.");
    }

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) throw new TwoFactorServiceError("Kode salah. Coba lagi.");

    const recoveryCodes = generateRecoveryCodes();
    const hashed = await Promise.all(recoveryCodes.map((c) => bcrypt.hash(c, 10)));

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorEnabledAt: new Date(),
        twoFactorRecoveryCodes: hashed,
      },
    });

    return { recoveryCodes };
  },

  async disable(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      throw new TwoFactorServiceError("2FA tidak sedang aktif.");
    }

    const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
    if (!valid) throw new TwoFactorServiceError("Kode salah.");

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: undefined,
        twoFactorEnabledAt: null,
      },
    });

    // docs/05 §3 — defense in depth: kalau nanti 2FA diaktifkan lagi,
    // tidak ada trusted-device token lama yang bisa dipakai bypass tanpa
    // persetujuan baru dari user.
    await revokeAllTrustedDevices(userId);
  },

  /** Dipakai saat login (lib/auth.ts Credentials.authorize) — TIDAK
   * memakai Server Action karena dipanggil dari NextAuth callback, bukan
   * dari komponen client. Menerima TOTP code ATAU salah satu recovery
   * code; recovery code yang terpakai langsung dihapus dari daftar
   * (sekali pakai, docs/05 §2). */
  async verifyLoginChallenge(
    userId: string,
    input: { totpCode?: string; recoveryCode?: string }
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) return true; // 2FA tidak aktif, lolos

    if (input.totpCode) {
      return authenticator.verify({ token: input.totpCode, secret: user.twoFactorSecret });
    }

    if (input.recoveryCode) {
      const hashes = (user.twoFactorRecoveryCodes as string[] | null) ?? [];
      for (let i = 0; i < hashes.length; i++) {
        if (await bcrypt.compare(input.recoveryCode, hashes[i])) {
          const remaining = hashes.filter((_, idx) => idx !== i);
          await prisma.user.update({
            where: { id: userId },
            data: { twoFactorRecoveryCodes: remaining },
          });
          return true;
        }
      }
      return false;
    }

    return false;
  },
};
