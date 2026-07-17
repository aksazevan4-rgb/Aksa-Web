"use server";

/**
 * features/api-keys/server/actions.ts
 * Entrypoint client untuk manajemen API Key milik sendiri (docs/15 §4).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { createApiKeySchema, revokeApiKeySchema } from "../validation";
import { apiKeyService, ApiKeyServiceError } from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof ApiKeyServiceError) return { success: false, error: error.message };
  console.error("[API_KEY_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

export async function createApiKeyAction(
  input: unknown
): Promise<ActionResult<{ rawToken: string; name: string }>> {
  try {
    const session = await verifySession();
    const parsed = createApiKeySchema.parse(input);
    const created = await apiKeyService.create(session.user.id, parsed.name);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "API_KEY_CREATE",
        entityType: "ApiKey",
        entityId: created.id,
        metadata: { name: created.name },
      },
    });

    revalidatePath("/dashboard/developer");
    return { success: true, data: { rawToken: created.rawToken, name: created.name } };
  } catch (error) {
    return fail(error);
  }
}

export async function revokeApiKeyAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = revokeApiKeySchema.parse(input);
    await apiKeyService.revoke(session.user.id, parsed.keyId);

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "API_KEY_REVOKE",
        entityType: "ApiKey",
        entityId: parsed.keyId,
      },
    });

    revalidatePath("/dashboard/developer");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}
