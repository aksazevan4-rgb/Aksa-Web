/**
 * lib/feature-flag-rollout.ts
 * Fungsi murni — dipisah dari service.ts (yang butuh Prisma) supaya bisa
 * diuji langsung tanpa DB (docs/17-testing-deployment.md §2).
 */

/** Hash string sederhana (djb2) → angka 0-99, deterministik untuk userId
 * yang sama. Bukan untuk keamanan (jangan pakai untuk crypto) — cuma untuk
 * membagi rata populasi user ke dalam kelompok rollout (docs/14 §8). */
export function hashToPercentBucket(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash) % 100;
}

/** Menentukan apakah user tertentu termasuk dalam rollout — flag harus
 * `enabled=true` DULU secara global, baru rolloutPercentage menentukan
 * subset user mana yang dapat aksesnya (docs/14 §8). */
export function isInRollout(userId: string, flagKey: string, rolloutPercentage: number): boolean {
  if (rolloutPercentage >= 100) return true;
  if (rolloutPercentage <= 0) return false;
  const bucket = hashToPercentBucket(`${flagKey}:${userId}`);
  return bucket < rolloutPercentage;
}
