/**
 * features/links/server/repository.ts
 *
 * Satu-satunya file yang memanggil `prisma.linkFolder`/`prisma.profileLink`
 * langsung untuk kapabilitas Link Management fase 4 (docs/03 §2). CRUD
 * dasar link (create/update/delete tunggal) TETAP di
 * app/dashboard/profile/links/actions.ts — tidak diduplikasi di sini.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const linkFolderRepository = {
  listForUser(userId: string) {
    return prisma.linkFolder.findMany({ where: { userId }, orderBy: { order: "asc" } });
  },

  async create(userId: string, name: string) {
    const max = await prisma.linkFolder.aggregate({ where: { userId }, _max: { order: true } });
    return prisma.linkFolder.create({
      data: { userId, name, order: (max._max.order ?? -1) + 1 },
    });
  },

  findOwned(id: string, userId: string) {
    return prisma.linkFolder.findFirst({ where: { id, userId } });
  },

  rename(id: string, name: string) {
    return prisma.linkFolder.update({ where: { id }, data: { name } });
  },

  delete(id: string) {
    // onDelete: SetNull di ProfileLink.folder — link tetap ada, cuma
    // kembali "tanpa folder", tidak ikut terhapus (docs/18 §4).
    return prisma.linkFolder.delete({ where: { id } });
  },

  async reorder(userId: string, orderedIds: string[]) {
    // `update()` where hanya menerima field unique (id) — LinkFolder tidak
    // punya @@unique([id, userId]), jadi kepemilikan diverifikasi dulu di
    // sini sebelum update, bukan disisipkan ke where update (yang akan
    // gagal secara tipe/tidak didukung Prisma).
    const owned = await prisma.linkFolder.findMany({
      where: { userId, id: { in: orderedIds } },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((f) => f.id));
    const safeIds = orderedIds.filter((id) => ownedIds.has(id));

    return prisma.$transaction(
      safeIds.map((id, index) => prisma.linkFolder.update({ where: { id }, data: { order: index } }))
    );
  },
};

export const linkRepository = {
  findOwned(id: string, userId: string) {
    return prisma.profileLink.findFirst({ where: { id, userId } });
  },

  /** Hanya mengembalikan id link yang benar-benar milik userId, dari
   * daftar id yang diminta — dipakai bulk actions untuk memastikan satu
   * user tidak bisa mengubah link milik user lain (docs/08 §5, docs/18 §1). */
  async filterOwnedIds(userId: string, linkIds: string[]) {
    const owned = await prisma.profileLink.findMany({
      where: { userId, id: { in: linkIds } },
      select: { id: true },
    });
    return owned.map((l) => l.id);
  },

  update(id: string, data: Prisma.ProfileLinkUpdateInput) {
    return prisma.profileLink.update({ where: { id }, data });
  },

  bulkUpdate(ids: string[], data: Prisma.ProfileLinkUpdateManyMutationInput) {
    return prisma.profileLink.updateMany({ where: { id: { in: ids } }, data });
  },

  bulkSoftDelete(ids: string[]) {
    // Belum ada kolom deletedAt di ProfileLink existing — hard delete tetap
    // dipakai untuk konsistensi dengan deleteProfileLink single existing,
    // dibungkus transaksi + audit log per item di service.ts (docs/18 §4
    // catatan: soft-delete penuh untuk ProfileLink adalah item migrasi
    // terpisah, lihat docs/04-database-design.md §1, belum diterapkan di sini
    // supaya tidak mengubah perilaku delete satu-link yang sudah berjalan).
    return prisma.profileLink.deleteMany({ where: { id: { in: ids } } });
  },
};
