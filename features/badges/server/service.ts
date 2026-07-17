/**
 * features/badges/server/service.ts
 *
 * Business logic domain badge. Tidak ada "use server" di sini — file ini
 * murni dipanggil oleh actions.ts, dan bisa langsung diuji dengan Vitest
 * tanpa perlu mem-mock Next.js request context (docs/17 §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { badgeRepository, userBadgeRepository } from "./repository";
import { MAX_FEATURED_BADGES, type CreateBadgeInput } from "../validation";

export class BadgeServiceError extends Error {}

export const badgeService = {
  async createBadge(input: CreateBadgeInput) {
    const existing = await badgeRepository.findByKey(input.key);
    if (existing) {
      throw new BadgeServiceError(`Badge dengan key "${input.key}" sudah ada.`);
    }
    return badgeRepository.create({
      key: input.key,
      name: input.name,
      description: input.description,
      category: input.category,
      icon: input.icon,
      rarity: input.rarity,
      requirement: input.requirement ?? undefined,
      isAnimated: input.isAnimated,
      isPurchasable: input.isPurchasable,
      priceCredits: input.priceCredits ?? null,
      availableFrom: input.availableFrom ?? null,
      availableUntil: input.availableUntil ?? null,
    });
  },

  /** Admin grant — satu-satunya jalur untuk requirement type "adminGrant"
   * (docs/10 §5). Selalu tercatat via AuditLog oleh pemanggil di actions.ts. */
  async adminGrantBadge(userId: string, badgeId: string) {
    const badge = await badgeRepository.findById(badgeId);
    if (!badge) throw new BadgeServiceError("Badge tidak ditemukan.");
    return userBadgeRepository.upsertGrant({ userId, badgeId, acquiredVia: "ADMIN_GRANT" });
  },

  /** Beli badge purchasable pakai Credits (docs/10 §5, docs/12 §4). Memotong
   * saldo dan memberi badge dalam satu transaksi — tidak pernah terpisah,
   * supaya tidak ada kondisi "credit terpotong tapi badge gagal masuk". */
  async purchaseBadge(userId: string, badgeId: string) {
    const badge = await badgeRepository.findById(badgeId);
    if (!badge || !badge.isPurchasable || !badge.priceCredits) {
      throw new BadgeServiceError("Badge ini tidak bisa dibeli.");
    }

    const already = await userBadgeRepository.findOne(userId, badgeId);
    if (already?.unlockedAt) {
      throw new BadgeServiceError("Badge ini sudah kamu miliki.");
    }

    // Catatan: tidak memanggil creditsRepository.adjustBalance (features/premium)
    // di sini karena repository itu memakai `prisma` global, sedangkan operasi
    // ini harus atomic dalam transaksi `tx` yang sama dengan upsert UserBadge
    // di bawah — supaya tidak ada kondisi "credit terpotong tapi badge gagal
    // masuk". Bentuk pencatatan transaksinya tetap sama (CreditTransaction
    // row dengan amount negatif), hanya klien Prisma-nya berbeda.
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.credits < badge.priceCredits!) {
        throw new BadgeServiceError("Credits tidak cukup untuk membeli badge ini.");
      }

      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: badge.priceCredits! } },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -badge.priceCredits!,
          reason: "BADGE_PURCHASE",
          relatedId: badge.id,
          note: `Beli badge: ${badge.name}`,
        },
      });

      await tx.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: {
          userId,
          badgeId,
          acquiredVia: "PURCHASE",
          unlockedAt: new Date(),
          progress: 100,
        },
        update: { unlockedAt: new Date(), progress: 100, acquiredVia: "PURCHASE" },
      });

      return badge;
    });
  },

  async setEquipped(userId: string, badgeId: string, equipped: boolean) {
    const owned = await userBadgeRepository.findOne(userId, badgeId);
    if (!owned?.unlockedAt) {
      throw new BadgeServiceError("Badge belum kamu miliki, tidak bisa di-equip.");
    }
    return userBadgeRepository.setEquipped(userId, badgeId, equipped);
  },

  /** Featured dibatasi per plan (docs/10 §3) — dicek di sini, satu tempat,
   * bukan diperiksa manual berulang di tiap pemanggil. */
  async setFeatured(userId: string, badgeId: string, featured: boolean, plan: "FREE" | "PREMIUM") {
    const owned = await userBadgeRepository.findOne(userId, badgeId);
    if (!owned?.unlockedAt) {
      throw new BadgeServiceError("Badge belum kamu miliki, tidak bisa ditampilkan.");
    }

    if (featured) {
      const current = await userBadgeRepository.countFeatured(userId);
      const limit = MAX_FEATURED_BADGES[plan];
      if (current >= limit) {
        throw new BadgeServiceError(
          `Batas featured badge untuk plan ${plan} adalah ${limit}. Lepas salah satu dulu, atau upgrade plan.`
        );
      }
    }

    return userBadgeRepository.setFeatured(userId, badgeId, featured);
  },

  listForUser(userId: string) {
    return userBadgeRepository.listForUser(userId);
  },

  listAll() {
    return badgeRepository.list();
  },
};
