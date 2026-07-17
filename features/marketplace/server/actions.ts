"use server";

/**
 * features/marketplace/server/actions.ts
 * Entrypoint client untuk pembelian template & review (docs/13-marketplace-template.md).
 * Apply/save/delete template TETAP di app/dashboard/profile/templates/actions.ts.
 */

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { verifySession } from "@/lib/dal";
import { purchaseTemplateSchema, submitTemplateReviewSchema } from "../validation";
import {
  templatePurchaseService,
  templateReviewService,
  templateModerationService,
  MarketplaceServiceError,
} from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof MarketplaceServiceError) return { success: false, error: error.message };
  console.error("[MARKETPLACE_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

export async function purchaseTemplateAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = purchaseTemplateSchema.parse(input);
    await templatePurchaseService.purchase(session.user.id, parsed.templateId);
    revalidatePath("/dashboard/profile/templates");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function submitTemplateReviewAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = submitTemplateReviewSchema.parse(input);
    await templateReviewService.submit(session.user.id, parsed.templateId, parsed.rating, parsed.comment);
    revalidatePath("/dashboard/profile/templates");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function approveTemplateAction(templateId: string): Promise<ActionResult> {
  try {
    const session = await verifySession();
    if (session.user.role !== Role.ADMIN) {
      return { success: false, error: "Kamu tidak punya akses untuk aksi ini." };
    }
    await templateModerationService.approve(templateId);
    revalidatePath("/dashboard/admin/moderation");
    revalidatePath("/dashboard/profile/templates");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function rejectTemplateAction(templateId: string): Promise<ActionResult> {
  try {
    const session = await verifySession();
    if (session.user.role !== Role.ADMIN) {
      return { success: false, error: "Kamu tidak punya akses untuk aksi ini." };
    }
    await templateModerationService.reject(templateId);
    revalidatePath("/dashboard/admin/moderation");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
