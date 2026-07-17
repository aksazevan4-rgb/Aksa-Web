/**
 * features/premium/server/service.ts
 * Business logic Credits. Tidak ada "use server" — testable langsung
 * (docs/17 §2).
 */

import "server-only";
import { creditsRepository } from "./repository";

export class PremiumServiceError extends Error {}

export const creditsService = {
  getBalance: creditsRepository.getBalance,
  listTransactions: creditsRepository.listTransactions,

  /** Satu-satunya jalur pemberian credits manual (docs/12 §4) — dipakai
   * juga oleh badge purchase (features/badges/server/service.ts) supaya
   * penambahan/pengurangan saldo selalu tercatat lewat repository yang
   * sama, tidak ada mutasi User.credits liar di file lain (docs/18 §1). */
  async adminGrantCredits(userId: string, amount: number) {
    if (amount <= 0) throw new PremiumServiceError("Jumlah credits harus lebih dari 0.");
    const [, transaction] = await creditsRepository.adjustBalance({
      userId,
      amount,
      reason: "ADMIN_GRANT",
    });
    return transaction;
  },
};
