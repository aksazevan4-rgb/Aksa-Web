"use server";

/**
 * features/links/server/actions.ts
 * Entrypoint client untuk kapabilitas Link Management fase 4 (folder, pin,
 * kategori, UTM, GEO, bulk actions). CRUD dasar satu-link (create/edit/
 * delete/reorder/toggle-visible) TETAP di app/dashboard/profile/links/actions.ts
 * — file ini murni menambah kapabilitas baru di atasnya (docs/18 §4).
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  createFolderSchema,
  renameFolderSchema,
  reorderFoldersSchema,
  assignLinkFolderSchema,
  setLinkPinnedSchema,
  setLinkCategorySchema,
  setLinkUtmSchema,
  setLinkGeoSchema,
  bulkLinkIdsSchema,
  bulkSetVisibilitySchema,
  bulkSetCategorySchema,
} from "../validation";
import { linkFolderService, linkOrganizeService, linkBulkService, LinkServiceError } from "./service";

type ActionResult<T = undefined> = { success: true; data?: T } | { success: false; error: string };

function fail(error: unknown): ActionResult {
  if (error instanceof LinkServiceError) return { success: false, error: error.message };
  console.error("[LINK_ACTION_ERROR]", error);
  return { success: false, error: "Terjadi kesalahan. Coba lagi." };
}

async function revalidateOwnerPaths(userId: string) {
  revalidatePath("/dashboard/profile/links");
  const owner = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (owner?.username) revalidatePath(`/${owner.username}`);
}

// ── Folder ──────────────────────────────────────────────────────────────

export async function createFolderAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = createFolderSchema.parse(input);
    await linkFolderService.create(session.user.id, parsed.name);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function renameFolderAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = renameFolderSchema.parse(input);
    await linkFolderService.rename(session.user.id, parsed.id, parsed.name);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFolderAction(folderId: string): Promise<ActionResult> {
  try {
    const session = await verifySession();
    await linkFolderService.remove(session.user.id, folderId);
    await revalidateOwnerPaths(session.user.id);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reorderFoldersAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = reorderFoldersSchema.parse(input);
    await linkFolderService.reorder(session.user.id, parsed.orderedIds);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

// ── Organize (folder assignment, pin, kategori, UTM, GEO) ───────────────

export async function assignLinkFolderAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = assignLinkFolderSchema.parse(input);
    await linkOrganizeService.assignFolder(session.user.id, parsed.linkId, parsed.folderId);
    await revalidateOwnerPaths(session.user.id);
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setLinkPinnedAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = setLinkPinnedSchema.parse(input);
    await linkOrganizeService.setPinned(session.user.id, parsed.linkId, parsed.pinned);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setLinkCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = setLinkCategorySchema.parse(input);
    await linkOrganizeService.setCategory(session.user.id, parsed.linkId, parsed.category);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setLinkUtmAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = setLinkUtmSchema.parse(input);
    await linkOrganizeService.setUtm(session.user.id, parsed);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

export async function setLinkGeoAction(input: unknown): Promise<ActionResult> {
  try {
    const session = await verifySession();
    const parsed = setLinkGeoSchema.parse(input);
    await linkOrganizeService.setGeoRestriction(session.user.id, parsed);
    revalidatePath("/dashboard/profile/links");
    return { success: true };
  } catch (error) {
    return fail(error);
  }
}

// ── Bulk actions (docs/08 §5) ────────────────────────────────────────────

export async function bulkDeleteLinksAction(input: unknown): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    const session = await verifySession();
    const parsed = bulkLinkIdsSchema.parse(input);
    const result = await linkBulkService.bulkDelete(session.user.id, parsed.linkIds);
    await revalidateOwnerPaths(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    return fail(error);
  }
}

export async function bulkSetVisibilityAction(
  input: unknown
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    const session = await verifySession();
    const parsed = bulkSetVisibilitySchema.parse(input);
    const result = await linkBulkService.bulkSetVisibility(session.user.id, parsed.linkIds, parsed.visible);
    await revalidateOwnerPaths(session.user.id);
    return { success: true, data: result };
  } catch (error) {
    return fail(error);
  }
}

export async function bulkSetCategoryAction(
  input: unknown
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    const session = await verifySession();
    const parsed = bulkSetCategorySchema.parse(input);
    const result = await linkBulkService.bulkSetCategory(session.user.id, parsed.linkIds, parsed.category);
    revalidatePath("/dashboard/profile/links");
    return { success: true, data: result };
  } catch (error) {
    return fail(error);
  }
}
