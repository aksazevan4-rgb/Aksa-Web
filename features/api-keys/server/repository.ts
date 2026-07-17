/**
 * features/api-keys/server/repository.ts
 * Satu-satunya file yang memanggil `prisma.apiKey` langsung (docs/03 §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export const apiKeyRepository = {
  listForUser(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  },

  findOwned(id: string, userId: string) {
    return prisma.apiKey.findFirst({ where: { id, userId } });
  },

  create(userId: string, name: string, keyPrefix: string, keyHash: string) {
    return prisma.apiKey.create({ data: { userId, name, keyPrefix, keyHash } });
  },

  revoke(id: string) {
    return prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  /** docs/15 §2 — dipakai autentikasi endpoint publik. Token API berbentuk
   * `{keyId}.{secret}` (lihat server/service.ts generateToken), jadi
   * autentikasi bisa langsung findUnique by id — bukan scan+bcrypt.compare
   * ke semua key aktif di seluruh user (tidak scalable). */
  findById(id: string) {
    return prisma.apiKey.findUnique({ where: { id } });
  },

  touchLastUsed(id: string) {
    return prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } });
  },
};
