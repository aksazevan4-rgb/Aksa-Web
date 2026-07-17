/**
 * lib/trusted-device.ts
 *
 * PRINSIP KEAMANAN (baca sebelum mengubah file ini):
 * - verifyTrustedDeviceToken() HARUS return `false` untuk setiap kondisi
 *   ambigu/tidak terduga (token salah format, device tidak ada di DB,
 *   sudah expired, userId tidak cocok, hash tidak cocok, atau exception
 *   apa pun). Tidak ada jalur yang boleh return `true` "by default".
 * - Token mentah HANYA ada di response createTrustedDeviceToken() sekali,
 *   untuk langsung dijadikan cookie oleh pemanggil (docs/05 §3, pola sama
 *   seperti ApiKey — features/api-keys/server/service.ts).
 */

import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { parseTrustedDeviceToken, formatTrustedDeviceToken } from "./trusted-device-token";

const TRUST_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 hari (docs/05 §3)

export async function createTrustedDeviceToken(userId: string, userAgent?: string): Promise<string> {
  const secret = randomBytes(24).toString("hex");
  const tokenHash = await bcrypt.hash(secret, 10);

  const record = await prisma.trustedDevice.create({
    data: {
      userId,
      tokenHash,
      userAgent: userAgent?.slice(0, 255),
      expiresAt: new Date(Date.now() + TRUST_DURATION_MS),
    },
  });

  return formatTrustedDeviceToken(record.id, secret);
}

/** Fail-closed di setiap titik — lihat catatan keamanan di atas. */
export async function verifyTrustedDeviceToken(userId: string, rawToken: string | null): Promise<boolean> {
  try {
    const parsed = parseTrustedDeviceToken(rawToken);
    if (!parsed) return false;

    const record = await prisma.trustedDevice.findUnique({ where: { id: parsed.deviceId } });
    if (!record) return false;
    if (record.userId !== userId) return false;
    if (record.expiresAt.getTime() < Date.now()) return false;

    const valid = await bcrypt.compare(parsed.secret, record.tokenHash);
    if (!valid) return false;

    // Best-effort — kegagalan update lastUsedAt tidak boleh menggagalkan
    // login yang sudah valid.
    prisma.trustedDevice
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
      .catch((err) => console.error("[TRUSTED_DEVICE_TOUCH_ERROR]", err));

    return true;
  } catch (error) {
    // Fail-closed: exception apa pun (DB down, dll) berarti TIDAK dipercaya,
    // bukan diam-diam diloloskan.
    console.error("[TRUSTED_DEVICE_VERIFY_ERROR]", error);
    return false;
  }
}

/** Dipanggil saat 2FA dinonaktifkan (features/two-factor/server/service.ts)
 * — semua trusted device lama untuk user ini dicabut sekaligus, supaya
 * kalau 2FA diaktifkan lagi nanti, tidak ada token lama yang tersisa bisa
 * dipakai bypass tanpa persetujuan baru (docs/05 §3, defense in depth). */
export async function revokeAllTrustedDevices(userId: string): Promise<void> {
  await prisma.trustedDevice.deleteMany({ where: { userId } });
}

export async function listTrustedDevices(userId: string) {
  return prisma.trustedDevice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, userAgent: true, expiresAt: true, lastUsedAt: true, createdAt: true },
  });
}

export async function revokeTrustedDevice(userId: string, deviceId: string): Promise<void> {
  await prisma.trustedDevice.deleteMany({ where: { id: deviceId, userId } });
}
