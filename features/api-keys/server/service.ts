/**
 * features/api-keys/server/service.ts
 * Business logic API Key. Tidak ada "use server" — testable langsung
 * (docs/17 §2).
 *
 * Format token: `{keyId}.{secret}` — bagian keyId dipakai untuk lookup
 * langsung (O(1), indexed by primary key), bagian secret dicocokkan
 * dengan bcrypt.compare hanya terhadap SATU row itu, bukan scan semua
 * key aktif di seluruh user (docs/15 §2, §6: keamanan & performa).
 */

import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { apiKeyRepository } from "./repository";

export class ApiKeyServiceError extends Error {}

const SECRET_BYTES = 24;

export const apiKeyService = {
  listForUser: apiKeyRepository.listForUser,

  /** Mengembalikan `rawToken` HANYA SEKALI saat pembuatan — setelah ini
   * hanya `keyPrefix` yang bisa dilihat lagi (docs/15 §4). */
  async create(userId: string, name: string) {
    const secret = randomBytes(SECRET_BYTES).toString("hex");
    const keyHash = await bcrypt.hash(secret, 10);
    const keyPrefix = secret.slice(0, 8);

    const created = await apiKeyRepository.create(userId, name, keyPrefix, keyHash);
    const rawToken = `${created.id}.${secret}`;

    return { id: created.id, name: created.name, rawToken };
  },

  async revoke(userId: string, keyId: string) {
    const owned = await apiKeyRepository.findOwned(keyId, userId);
    if (!owned) throw new ApiKeyServiceError("API key tidak ditemukan.");
    if (owned.revokedAt) return owned; // idempotent
    return apiKeyRepository.revoke(keyId);
  },

  /** Dipakai route publik (docs/15 §2) — bukan Server Action, tidak
   * bergantung session cookie. Mengembalikan userId pemilik key kalau
   * valid, atau null kalau tidak (token salah format, key tidak ada,
   * sudah revoked, atau secret tidak cocok). */
  async verifyToken(rawToken: string): Promise<{ userId: string; keyId: string } | null> {
    const [keyId, secret] = rawToken.split(".");
    if (!keyId || !secret) return null;

    const record = await apiKeyRepository.findById(keyId);
    if (!record || record.revokedAt) return null;

    const valid = await bcrypt.compare(secret, record.keyHash);
    if (!valid) return null;

    // Best-effort — jangan sampai gagal update lastUsedAt memblokir request.
    apiKeyRepository.touchLastUsed(record.id).catch((err) => {
      console.error("[API_KEY_TOUCH_ERROR]", err);
    });

    return { userId: record.userId, keyId: record.id };
  },
};
