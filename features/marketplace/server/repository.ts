/**
 * features/marketplace/server/repository.ts
 * Satu-satunya file yang memanggil `prisma.templatePurchase`/
 * `prisma.templateReview` langsung (docs/03 §2). CRUD ProfileTemplate
 * dasar (save/apply/delete/visibility) TETAP di
 * app/dashboard/profile/templates/actions.ts — tidak diduplikasi di sini.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export const templatePurchaseRepository = {
  findOwned(userId: string, templateId: string) {
    return prisma.templatePurchase.findUnique({
      where: { userId_templateId: { userId, templateId } },
    });
  },

  create(userId: string, templateId: string, pricePaid: number) {
    return prisma.templatePurchase.create({ data: { userId, templateId, pricePaid } });
  },
};

export const templateReviewRepository = {
  findOne(templateId: string, userId: string) {
    return prisma.templateReview.findUnique({
      where: { templateId_userId: { templateId, userId } },
    });
  },

  upsert(templateId: string, userId: string, rating: number, comment?: string) {
    return prisma.templateReview.upsert({
      where: { templateId_userId: { templateId, userId } },
      create: { templateId, userId, rating, comment },
      update: { rating, comment },
    });
  },

  listForTemplate(templateId: string) {
    return prisma.templateReview.findMany({
      where: { templateId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, name: true, image: true } } },
    });
  },

  /** docs/13 §4 — rating rata-rata di-recompute penuh, bukan running
   * average yang bisa drift. Volume review per template rendah, jadi
   * aman dihitung ulang penuh tiap ada review baru (docs/13 §4). */
  async recomputeAverage(templateId: string) {
    const agg = await prisma.templateReview.aggregate({
      where: { templateId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return prisma.profileTemplate.update({
      where: { id: templateId },
      data: {
        rating: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  },
};
