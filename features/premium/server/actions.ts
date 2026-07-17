"use server";

/**
 * features/premium/server/actions.ts
 * Entrypoint client untuk Credits (docs/12-premium-system.md §4).
 */

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { grantCreditsSchema } from "../validation";
import { creditsService, PremiumServiceError } from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof PremiumServiceError) return { success: false, error: error.message };
  console.error("[PREMIUM_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

/** Admin only — belum ada payment gateway (Stripe/QRIS) terhubung di
 * codebase ini, jadi pemberian credits hari ini manual lewat Admin Panel,
 * sama seperti alur aktivasi Premium existing (app/dashboard/settings/
 * PremiumSection.tsx: "Hubungi admin via Discord ... admin yang
 * konfirmasi"). Ini pola sengaja, bukan celah yang lupa ditutup. */
export async function grantCreditsAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    if (session.user.role !== Role.ADMIN) {
      return { success: false, error: "Kamu tidak punya akses untuk aksi ini." };
    }

    const parsed = grantCreditsSchema.parse(input);
    await creditsService.adminGrantCredits(parsed.userId, parsed.amount);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREDIT_GRANT",
        entityType: "User",
        entityId: parsed.userId,
        metadata: { amount: parsed.amount, reason: parsed.reason },
      },
    });

    revalidatePath(`/dashboard/admin/users/${parsed.userId}`);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
