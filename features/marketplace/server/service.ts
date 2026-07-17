/**
 * features/marketplace/server/service.ts
 * Business logic Marketplace & Template. Tidak ada "use server" — testable
 * langsung (docs/17 §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { templatePurchaseRepository, templateReviewRepository } from "./repository";

export class MarketplaceServiceError extends Error {}

export const templatePurchaseService = {
  /** Membeli template pakai Credits (docs/13 §3, docs/12 §4). Template
   * gratis (price null/0) langsung tercatat "dimiliki" tanpa transaksi
   * credit — supaya bisa dipakai berulang tanpa charge, dan supaya user
   * bisa memberi review (docs/13 §4: review hanya dari yang sudah pakai). */
  async purchase(userId: string, templateId: string) {
    const template = await prisma.profileTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new MarketplaceServiceError("Template tidak ditemukan.");
    if (template.visibility !== "PUBLIC") {
      throw new MarketplaceServiceError("Template ini tidak tersedia di marketplace.");
    }

    const already = await templatePurchaseRepository.findOwned(userId, templateId);
    if (already) return already; // idempotent — sudah dimiliki, tidak ditagih dua kali

    const price = template.price ?? 0;
    if (price <= 0) {
      return templatePurchaseRepository.create(userId, templateId, 0);
    }

    if (template.authorId === userId) {
      // Pembuat sendiri tidak perlu "membeli" template miliknya.
      return templatePurchaseRepository.create(userId, templateId, 0);
    }

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.credits < price) {
        throw new MarketplaceServiceError("Credits tidak cukup untuk membeli template ini.");
      }

      await tx.user.update({ where: { id: userId }, data: { credits: { decrement: price } } });
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -price,
          reason: "MARKETPLACE_PURCHASE",
          relatedId: templateId,
          note: `Beli template: ${template.name}`,
        },
      });

      return tx.templatePurchase.create({ data: { userId, templateId, pricePaid: price } });
    });
  },

  isOwned(userId: string, templateId: string) {
    return templatePurchaseRepository.findOwned(userId, templateId);
  },
};

export const templateReviewService = {
  async submit(userId: string, templateId: string, rating: number, comment?: string) {
    const owned = await templatePurchaseRepository.findOwned(userId, templateId);
    if (!owned) {
      throw new MarketplaceServiceError(
        "Kamu harus pakai template ini dulu sebelum bisa memberi review."
      );
    }

    await templateReviewRepository.upsert(templateId, userId, rating, comment);
    return templateReviewRepository.recomputeAverage(templateId);
  },

  listForTemplate: templateReviewRepository.listForTemplate,
};

export const templateModerationService = {
  /** docs/14-admin-panel.md §5 — antrian moderasi, hanya relevan kalau
   * SiteConfig.requireTemplateModeration diaktifkan admin. */
  listPending() {
    return prisma.profileTemplate.findMany({
      where: { visibility: "PUBLIC", pendingReview: true },
      orderBy: { updatedAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        updatedAt: true,
        author: { select: { username: true, name: true } },
      },
    });
  },

  async approve(templateId: string) {
    return prisma.profileTemplate.update({ where: { id: templateId }, data: { pendingReview: false } });
  },

  /** Reject mengembalikan template ke PRIVATE — bukan menghapusnya, sesuai
   * prinsip "jangan hapus fitur/karya user tanpa alasan kuat" (docs/18 §4). */
  async reject(templateId: string) {
    return prisma.profileTemplate.update({
      where: { id: templateId },
      data: { visibility: "PRIVATE", pendingReview: false },
    });
  },
};
