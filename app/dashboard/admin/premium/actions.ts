"use server";

import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Toggle a feature on/off for a given plan. This is the core admin
 * control that lets admins move features between Free/Premium without
 * any code change — directly mutates the PremiumPlanFeature join table.
 */
export async function togglePlanFeature(
  planId: string,
  featureId: string,
  enabled: boolean
) {
  const session = await verifyAdmin();

  if (enabled) {
    await prisma.premiumPlanFeature.upsert({
      where: { planId_featureId: { planId, featureId } },
      create: { planId, featureId },
      update: {},
    });
  } else {
    await prisma.premiumPlanFeature.deleteMany({
      where: { planId, featureId },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.ADMIN_ACTION,
      entityType: "PremiumPlanFeature",
      entityId: `${planId}:${featureId}`,
      metadata: { enabled },
    },
  });

  // Invalidate the cached feature-key lookup so changes apply immediately.
  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/premium");
}

export async function updatePlanPrice(planId: string, price: number, discountPct: number) {
  const session = await verifyAdmin();

  await prisma.premiumPlan.update({
    where: { id: planId },
    data: { price, discountPct },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.ADMIN_ACTION,
      entityType: "PremiumPlan",
      entityId: planId,
      metadata: { price, discountPct },
    },
  });

  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/premium");
}

export async function createPremiumFeature(data: {
  key: string;
  label: string;
  description?: string;
  category?: string;
}) {
  const session = await verifyAdmin();

  const feature = await prisma.premiumFeature.create({
    data: {
      key: data.key,
      label: data.label,
      description: data.description,
      category: data.category,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.ADMIN_ACTION,
      entityType: "PremiumFeature",
      entityId: feature.id,
      metadata: { created: data },
    },
  });

  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/premium");
  return feature;
}

export async function createPremiumPlan(data: {
  name: string;
  label: string;
  price: number;
  durationDays?: number | null;
}) {
  const session = await verifyAdmin();

  const plan = await prisma.premiumPlan.create({
    data: {
      name: data.name,
      label: data.label,
      price: data.price,
      durationDays: data.durationDays ?? null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.ADMIN_ACTION,
      entityType: "PremiumPlan",
      entityId: plan.id,
      metadata: { created: data },
    },
  });

  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/premium");
  return plan;
}

export async function deletePremiumPlan(planId: string) {
  const session = await verifyAdmin();

  await prisma.premiumPlan.delete({ where: { id: planId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.ADMIN_ACTION,
      entityType: "PremiumPlan",
      entityId: planId,
      metadata: { deleted: true },
    },
  });

  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/premium");
}
