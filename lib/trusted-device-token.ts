/**
 * lib/trusted-device-token.ts
 *
 * Fungsi murni parsing/format token trusted-device. Format sama seperti
 * API key (features/api-keys/server/service.ts): `{deviceId}.{secret}` —
 * deviceId dipakai lookup O(1) by primary key, secret dicocokkan dengan
 * bcrypt.compare hanya terhadap SATU row (docs/05 §3, docs/15 §2 pola sama).
 *
 * Dipisah dari lib/trusted-device.ts (yang butuh Prisma) supaya logic
 * parsing-nya sendiri bisa diuji tanpa DB (docs/17-testing-deployment.md §2).
 */

export const TRUSTED_DEVICE_COOKIE_NAME = "aksa_trusted_device";

export function parseTrustedDeviceToken(
  raw: string | undefined | null
): { deviceId: string; secret: string } | null {
  if (!raw) return null;
  const separatorIndex = raw.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex === raw.length - 1) return null;

  const deviceId = raw.slice(0, separatorIndex);
  const secret = raw.slice(separatorIndex + 1);
  if (!deviceId || !secret) return null;

  return { deviceId, secret };
}

export function formatTrustedDeviceToken(deviceId: string, secret: string): string {
  return `${deviceId}.${secret}`;
}

/** Ekstrak nilai cookie tertentu dari header `Cookie` mentah (format
 * `a=1; b=2`), tanpa dependency library cookie-parsing tambahan — cukup
 * untuk satu nama cookie spesifik. Return null kalau tidak ditemukan
 * (fail-closed: pemanggil HARUS memperlakukan null sebagai "tidak
 * dipercaya", bukan mengasumsikan apa pun). */
export function extractCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;
    const key = part.slice(0, eqIndex).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eqIndex + 1).trim());
    }
  }
  return null;
}
