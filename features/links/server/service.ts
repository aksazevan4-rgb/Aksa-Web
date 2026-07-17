/**
 * features/links/server/service.ts
 * Business logic Link Management fase 4. Tidak ada "use server" — testable
 * langsung dengan Vitest tanpa mem-mock Next.js request context (docs/17 §2).
 */

import "server-only";
import { linkFolderRepository, linkRepository } from "./repository";
import type { SetLinkGeoInput, SetLinkUtmInput } from "../validation";

export class LinkServiceError extends Error {}

export const linkFolderService = {
  listForUser: linkFolderRepository.listForUser,

  create(userId: string, name: string) {
    return linkFolderRepository.create(userId, name);
  },

  async rename(userId: string, id: string, name: string) {
    const owned = await linkFolderRepository.findOwned(id, userId);
    if (!owned) throw new LinkServiceError("Folder tidak ditemukan.");
    return linkFolderRepository.rename(id, name);
  },

  async remove(userId: string, id: string) {
    const owned = await linkFolderRepository.findOwned(id, userId);
    if (!owned) throw new LinkServiceError("Folder tidak ditemukan.");
    return linkFolderRepository.delete(id);
  },

  reorder(userId: string, orderedIds: string[]) {
    return linkFolderRepository.reorder(userId, orderedIds);
  },
};

export const linkOrganizeService = {
  async assignFolder(userId: string, linkId: string, folderId: string | null) {
    const link = await linkRepository.findOwned(linkId, userId);
    if (!link) throw new LinkServiceError("Link tidak ditemukan.");

    if (folderId) {
      const folder = await linkFolderRepository.findOwned(folderId, userId);
      if (!folder) throw new LinkServiceError("Folder tidak ditemukan.");
    }

    return linkRepository.update(linkId, { folder: folderId ? { connect: { id: folderId } } : { disconnect: true } });
  },

  async setPinned(userId: string, linkId: string, pinned: boolean) {
    const link = await linkRepository.findOwned(linkId, userId);
    if (!link) throw new LinkServiceError("Link tidak ditemukan.");
    return linkRepository.update(linkId, { pinned });
  },

  async setCategory(userId: string, linkId: string, category: string | null) {
    const link = await linkRepository.findOwned(linkId, userId);
    if (!link) throw new LinkServiceError("Link tidak ditemukan.");
    return linkRepository.update(linkId, { category });
  },

  async setUtm(userId: string, input: SetLinkUtmInput) {
    const link = await linkRepository.findOwned(input.linkId, userId);
    if (!link) throw new LinkServiceError("Link tidak ditemukan.");
    return linkRepository.update(input.linkId, { utmParams: input.utmParams ?? undefined });
  },

  async setGeoRestriction(userId: string, input: SetLinkGeoInput) {
    const link = await linkRepository.findOwned(input.linkId, userId);
    if (!link) throw new LinkServiceError("Link tidak ditemukan.");
    return linkRepository.update(input.linkId, { geoRestriction: input.geoRestriction ?? undefined });
  },
};

export const linkBulkService = {
  /** Selalu memfilter ulang ke id yang benar-benar milik user, tidak
   * mempercayai daftar id dari client mentah-mentah (docs/08 §5, docs/18 §1). */
  async bulkDelete(userId: string, linkIds: string[]) {
    const safeIds = await linkRepository.filterOwnedIds(userId, linkIds);
    if (safeIds.length === 0) throw new LinkServiceError("Tidak ada link valid untuk dihapus.");
    await linkRepository.bulkSoftDelete(safeIds);
    return { deletedCount: safeIds.length };
  },

  async bulkSetVisibility(userId: string, linkIds: string[], visible: boolean) {
    const safeIds = await linkRepository.filterOwnedIds(userId, linkIds);
    if (safeIds.length === 0) throw new LinkServiceError("Tidak ada link valid.");
    await linkRepository.bulkUpdate(safeIds, { visible });
    return { updatedCount: safeIds.length };
  },

  async bulkSetCategory(userId: string, linkIds: string[], category: string | null) {
    const safeIds = await linkRepository.filterOwnedIds(userId, linkIds);
    if (safeIds.length === 0) throw new LinkServiceError("Tidak ada link valid.");
    await linkRepository.bulkUpdate(safeIds, { category });
    return { updatedCount: safeIds.length };
  },
};
