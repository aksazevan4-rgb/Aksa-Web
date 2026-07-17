"use server";

/**
 * features/two-factor/server/actions.ts
 * Entrypoint client untuk enrollment/disable 2FA (docs/05-auth-system.md §2).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { confirmEnrollmentSchema, disableTwoFactorSchema } from "../validation";
import { twoFactorService, TwoFactorServiceError } from "./service";
import { revokeTrustedDevice } from "@/lib/trusted-device";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof TwoFactorServiceError) return { success: false, error: error.message };
  console.error("[TWO_FACTOR_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

export async function startTwoFactorEnrollmentAction(): Promise<
  ActionResult<{ qrDataUrl: string }>
> {
  try {
    const session = await verifySession();
    const label = session.user.email ?? session.user.id;
    const { qrDataUrl } = await twoFactorService.startEnrollment(session.user.id, label);
    return { success: true, data: { qrDataUrl } };
  } catch (error) {
    return fail(error);
  }
}

export async function confirmTwoFactorEnrollmentAction(
  input: unknown
): Promise<ActionResult<{ recoveryCodes: string[] }>> {
  try {
    const session = await verifySession();
    const parsed = confirmEnrollmentSchema.parse(input);
    const { recoveryCodes } = await twoFactorService.confirmEnrollment(session.user.id, parsed.code);

    await prisma.auditLog.create({
      data: { actorId: session.user.id, action: "TWO_FACTOR_ENABLE", entityType: "User", entityId: session.user.id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, data: { recoveryCodes } };
  } catch (error) {
    return fail(error);
  }
}

export async function disableTwoFactorAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = disableTwoFactorSchema.parse(input);
    await twoFactorService.disable(session.user.id, parsed.code);

    await prisma.auditLog.create({
      data: { actorId: session.user.id, action: "TWO_FACTOR_DISABLE", entityType: "User", entityId: session.user.id },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function revokeTrustedDeviceAction(deviceId: string): Promise<ActionResult> {
  try {
    const session = await verifySession();
    await revokeTrustedDevice(session.user.id, deviceId);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "TRUSTED_DEVICE_REVOKE",
        entityType: "TrustedDevice",
        entityId: deviceId,
      },
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
