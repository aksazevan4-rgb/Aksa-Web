/**
 * features/premium/server/repository.ts
 * Satu-satunya file yang memanggil `prisma.creditTransaction`/
 * `prisma.user` (untuk field credits) langsung (docs/03 §2).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { CreditTransactionReason } from "@prisma/client";

export const creditsRepository = {
  getBalance(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
  },

  listTransactions(userId: string, take = 20) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  /** Menambah/mengurangi saldo dan mencatat transaksi dalam satu transaksi
   * DB — tidak pernah terpisah (docs/12 §4: "transparansi riwayat penuh"). */
  adjustBalance(params: {
    userId: string;
    amount: number;
    reason: CreditTransactionReason;
    relatedId?: string;
    note?: string;
  }) {
    const { userId, amount, reason, relatedId, note } = params;
    return prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { credits: { increment: amount } } }),
      prisma.creditTransaction.create({ data: { userId, amount, reason, relatedId, note } }),
    ]);
  },
};
