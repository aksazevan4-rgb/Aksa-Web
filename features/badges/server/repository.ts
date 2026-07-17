/**
 * features/badges/server/repository.ts
 *
 * Satu-satunya file di domain "badges" yang memanggil `prisma.badge`/
 * `prisma.userBadge` langsung — service.ts dan actions.ts tidak pernah
 * mengimpor `@/lib/prisma` sendiri (docs/03-backend-architecture.md §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const badgeRepository = {
  findByKey(key: string) {
    return prisma.badge.findUnique({ where: { key } });
  },

  findById(id: string) {
    return prisma.badge.findUnique({ where: { id } });
  },

  list(where?: Prisma.BadgeWhereInput) {
    return prisma.badge.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  },

  create(data: Prisma.BadgeCreateInput) {
    return prisma.badge.create({ data });
  },

  update(id: string, data: Prisma.BadgeUpdateInput) {
    return prisma.badge.update({ where: { id }, data });
  },
};

export const userBadgeRepository = {
  findOne(userId: string, badgeId: string) {
    return prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
    });
  },

  listForUser(userId: string) {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { unlockedAt: "desc" },
    });
  },

  countFeatured(userId: string) {
    return prisma.userBadge.count({ where: { userId, featured: true } });
  },

  upsertGrant(params: {
    userId: string;
    badgeId: string;
    acquiredVia: "SYSTEM" | "PURCHASE" | "ADMIN_GRANT" | "EVENT";
  }) {
    const { userId, badgeId, acquiredVia } = params;
    return prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      create: { userId, badgeId, acquiredVia, unlockedAt: new Date(), progress: 100 },
      update: { unlockedAt: new Date(), progress: 100 },
    });
  },

  setEquipped(userId: string, badgeId: string, equipped: boolean) {
    return prisma.userBadge.update({
      where: { userId_badgeId: { userId, badgeId } },
      data: { equipped },
    });
  },

  setFeatured(userId: string, badgeId: string, featured: boolean) {
    return prisma.userBadge.update({
      where: { userId_badgeId: { userId, badgeId } },
      data: { featured },
    });
  },
};
