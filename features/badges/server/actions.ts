"use server";

/**
 * features/badges/server/actions.ts
 *
 * Entrypoint yang dipanggil langsung dari komponen client. Setiap fungsi:
 *   1. verifySession() — auth wajib (lib/dal.ts, pola existing project)
 *   2. parse Zod       — validasi input (features/badges/validation.ts)
 *   3. panggil service — business logic (./service.ts)
 *   4. audit log        — untuk aksi admin (docs/03 §9, docs/18 §1)
 *   5. revalidatePath    — supaya UI langsung mencerminkan perubahan
 */

import { revalidatePath } from "next/cache";
import { AuditAction, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  createBadgeSchema,
  grantBadgeSchema,
  equipBadgeSchema,
  featureBadgeSchema,
} from "../validation";
import { badgeService, BadgeServiceError } from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof BadgeServiceError) return { success: false, error: error.message };
  console.error("[BADGE_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

/** `session.user` tidak menyimpan `username` (lihat types/next-auth.d.ts) —
 * ambil dari DB, pola yang sama dengan `revalidateOwnerPaths` di
 * app/dashboard/profile/links/actions.ts. */
async function revalidatePublicProfile(userId: string) {
  const owner = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (owner?.username) revalidatePath(`/${owner.username}`);
}

async function requireAdmin() {
  const session = await verifySession();
  if (session.user.role !== Role.ADMIN) {
    throw new BadgeServiceError("Kamu tidak punya akses untuk aksi ini.");
  }
  return session;
}

/** Admin only — buat definisi badge baru (docs/14 §3). */
export async function createBadgeAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = createBadgeSchema.parse(input);
    const badge = await badgeService.createBadge(parsed);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.ADMIN_ACTION,
        entityType: "Badge",
        entityId: badge.id,
        metadata: { key: badge.key },
      },
    });

    revalidatePath("/dashboard/admin/badges");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/** Admin only — grant badge ke user tertentu, wajib disertai alasan
 * (docs/10 §5, docs/14 §2: "grant/revoke badge ... wajib isi alasan"). */
export async function grantBadgeAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const parsed = grantBadgeSchema.parse(input);
    await badgeService.adminGrantBadge(parsed.userId, parsed.badgeId);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.BADGE_GRANT,
        entityType: "UserBadge",
        entityId: parsed.badgeId,
        metadata: { targetUserId: parsed.userId, reason: parsed.reason },
      },
    });

    revalidatePath(`/dashboard/admin/users/${parsed.userId}`);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/** User memilih badge mana yang di-equip (docs/10 §4) — tidak perlu admin,
 * aksi ringan milik user sendiri, reversible instan. */
export async function setEquippedBadgeAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = equipBadgeSchema.parse(input);
    await badgeService.setEquipped(session.user.id, parsed.badgeId, parsed.equipped);

    await revalidatePublicProfile(session.user.id);
    revalidatePath("/dashboard/badges");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

/** User memilih badge untuk Featured showcase (docs/10 §3), dibatasi
 * jumlah sesuai plan (dicek di service.ts). */
export async function setFeaturedBadgeAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = featureBadgeSchema.parse(input);

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { plan: true },
    });

    await badgeService.setFeatured(session.user.id, parsed.badgeId, parsed.featured, dbUser.plan);

    await revalidatePublicProfile(session.user.id);
    revalidatePath("/dashboard/badges");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function purchaseBadgeAction(badgeId: string): Promise<ActionResult> {
  try {
    const session = await verifySession();
    await badgeService.purchaseBadge(session.user.id, badgeId);

    revalidatePath("/dashboard/badges");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
