"use server";

/**
 * features/feature-flags/server/actions.ts
 * Entrypoint client untuk Admin Panel — Feature Flags (docs/14-admin-panel.md §8).
 */

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { createFlagSchema, updateFlagSchema } from "../validation";
import { featureFlagService, FeatureFlagServiceError } from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof FeatureFlagServiceError) return { success: false, error: error.message };
  console.error("[FEATURE_FLAG_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

async function requireAdmin() {
  const session = await verifySession();
  if (session.user.role !== Role.ADMIN) {
    throw new FeatureFlagServiceError("Kamu tidak punya akses untuk aksi ini.");
  }
  return session;
}

export async function createFeatureFlagAction(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = createFlagSchema.parse(input);
    await featureFlagService.create(parsed.key, parsed.description);
    revalidatePath("/dashboard/admin/feature-flags");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function updateFeatureFlagAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = updateFlagSchema.parse(input);
    const updated = await featureFlagService.update(parsed.id, parsed.enabled, parsed.rolloutPercentage);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "FEATURE_FLAG_UPDATE",
        entityType: "FeatureFlag",
        entityId: updated.id,
        metadata: { key: updated.key, enabled: parsed.enabled, rolloutPercentage: parsed.rolloutPercentage },
      },
    });

    revalidatePath("/dashboard/admin/feature-flags");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
