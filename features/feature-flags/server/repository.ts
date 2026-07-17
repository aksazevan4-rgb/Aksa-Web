/**
 * features/feature-flags/server/repository.ts
 * Satu-satunya file yang memanggil `prisma.featureFlag` langsung (docs/03 §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export const featureFlagRepository = {
  list() {
    return prisma.featureFlag.findMany({ orderBy: { key: "asc" } });
  },

  findByKey(key: string) {
    return prisma.featureFlag.findUnique({ where: { key } });
  },

  create(key: string, description?: string) {
    return prisma.featureFlag.create({ data: { key, description } });
  },

  update(id: string, enabled: boolean, rolloutPercentage: number) {
    return prisma.featureFlag.update({ where: { id }, data: { enabled, rolloutPercentage } });
  },
};
