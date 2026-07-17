/**
 * features/feature-flags/server/service.ts
 * Business logic Feature Flags. `isEnabled` dipakai luas (bisa dipanggil
 * di banyak request), jadi diberi cache in-memory berumur pendek supaya
 * tidak menambah 1 query DB di setiap request yang mengecek sebuah flag —
 * trade-off yang sama seperti lib/rate-limit.ts (in-memory, per-instance,
 * best-effort — lihat catatan jujur di file itu soal keterbatasannya di
 * lingkungan serverless multi-instance).
 */

import "server-only";
import { featureFlagRepository } from "./repository";
import { isInRollout } from "@/lib/feature-flag-rollout";

export class FeatureFlagServiceError extends Error {}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { enabled: boolean; rolloutPercentage: number; expiresAt: number }>();

export const featureFlagService = {
  list: featureFlagRepository.list,

  async create(key: string, description?: string) {
    const existing = await featureFlagRepository.findByKey(key);
    if (existing) throw new FeatureFlagServiceError(`Flag dengan key "${key}" sudah ada.`);
    return featureFlagRepository.create(key, description);
  },

  async update(id: string, enabled: boolean, rolloutPercentage: number) {
    const result = await featureFlagRepository.update(id, enabled, rolloutPercentage);
    cache.delete(result.key); // invalidate — perubahan admin harus langsung terasa
    return result;
  },

  /** Dipakai luas lintas fitur untuk cek "apakah flag X aktif untuk user
   * ini" (docs/14 §8). Kalau flag tidak ditemukan di DB, dianggap OFF
   * (fail-closed — fitur baru yang belum di-daftar tidak tiba-tiba aktif). */
  async isEnabled(key: string, userId?: string): Promise<boolean> {
    let entry = cache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      const flag = await featureFlagRepository.findByKey(key);
      entry = {
        enabled: flag?.enabled ?? false,
        rolloutPercentage: flag?.rolloutPercentage ?? 0,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      cache.set(key, entry);
    }

    if (!entry.enabled) return false;
    if (!userId) return entry.rolloutPercentage >= 100;
    return isInRollout(userId, key, entry.rolloutPercentage);
  },
};
