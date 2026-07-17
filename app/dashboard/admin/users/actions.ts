"use server";

import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Grant or revoke Premium plan for a specific user.
 * Admin controls this entirely from the dashboard — no code change needed.
 * When revoking, also clears premiumSince / premiumExpiresAt.
 */
export async function setUserPlan(
  userId: string,
  plan: "FREE" | "PREMIUM",
  expiresInDays?: number | null
) {
  const session = await verifyAdmin();

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFounder: true, plan: true, email: true },
  });

  if (!target) return { error: "User tidak ditemukan." };

  const data: Prisma.UserUpdateInput = { plan };

  if (plan === "PREMIUM") {
    data.premiumSince = new Date();
    data.premiumExpiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400_000)
      : null;
  } else {
    data.premiumSince = null;
    data.premiumExpiresAt = null;
  }

  await prisma.user.update({ where: { id: userId }, data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.USER_PLAN_CHANGE,
      entityType: "User",
      entityId: userId,
      metadata: { previousPlan: target.plan, newPlan: plan, expiresInDays },
    },
  });

  // Bust premium-features cache so next request picks up new plan.
  revalidateTag("premium-features", "max");
  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function setUserRole(userId: string, role: "ADMIN" | "USER") {
  const session = await verifyAdmin();

  if (userId === session.user.id) {
    return { error: "Tidak bisa mengubah role diri sendiri." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFounder: true, role: true },
  });

  if (!target) return { error: "User tidak ditemukan." };
  if (target.isFounder) return { error: "Role Founder tidak bisa diubah." };

  await prisma.user.update({ where: { id: userId }, data: { role } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.USER_ROLE_CHANGE,
      entityType: "User",
      entityId: userId,
      metadata: { previousRole: target.role, newRole: role },
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function setUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED"
) {
  const session = await verifyAdmin();

  if (userId === session.user.id) {
    return { error: "Tidak bisa mengubah status diri sendiri." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFounder: true, accountStatus: true },
  });

  if (!target) return { error: "User tidak ditemukan." };
  if (target.isFounder) return { error: "Status Founder tidak bisa diubah." };

  await prisma.user.update({ where: { id: userId }, data: { accountStatus: status } });

  const action = status === "BANNED"
    ? ("USER_BAN" as const)
    : status === "ACTIVE"
    ? ("USER_UNBAN" as const)
    : ("USER_UPDATE" as const);

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action,
      entityType: "User",
      entityId: userId,
      metadata: { previousStatus: target.accountStatus, newStatus: status },
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await verifyAdmin();

  if (userId === session.user.id) {
    return { error: "Tidak bisa menghapus akun sendiri." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isFounder: true, email: true },
  });

  if (!target) return { error: "User tidak ditemukan." };
  if (target.isFounder) return { error: "Akun Founder tidak bisa dihapus." };

  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.USER_DELETE,
      entityType: "User",
      entityId: userId,
      metadata: { deletedEmail: target.email },
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}
