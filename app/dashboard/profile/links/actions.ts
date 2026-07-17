"use server";

import { revalidatePath } from "next/cache";
import { AuditAction, type ProfileLink } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getProfileLinkError, sanitizeLinkLabel } from "@/lib/validation";
import { FREE_LINK_LIMIT, hasPremiumAccess } from "@/lib/premium";

interface ActionResult {
  error?: string;
  success?: boolean;
  /**
   * Object ProfileLink LENGKAP hasil langsung dari Prisma (create/update),
   * bukan potongan field yang direkonstruksi manual. Ini penting supaya
   * konsumen (ProfileLinkForm -> onSaved -> ProfileLinksClient.setItems)
   * selalu menerima tipe yang benar-benar cocok dengan `ProfileLink[]`
   * tanpa perlu type assertion (`as ProfileLink`).
   */
  link?: ProfileLink;
}

async function revalidateOwnerPaths(userId: string) {
  revalidatePath("/dashboard/profile/links");
  revalidatePath("/dashboard/profile");

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (owner?.username) {
    revalidatePath(`/${owner.username}`);
  }
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

/** Parses the Fase-3 fields shared by create/edit. Returns an error string
 * if something is invalid, otherwise the parsed values ready for Prisma. */
async function parseExtraLinkFields(formData: FormData): Promise<
  | { error: string }
  | {
      description: string | null;
      color: string | null;
      scheduledStart: Date | null;
      scheduledEnd: Date | null;
      openInNewTab: boolean;
      passwordUpdate: { set: string | null } | null; // null = "don't change"
    }
> {
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw ? descriptionRaw.slice(0, 140) : null;

  const colorRaw = String(formData.get("color") ?? "").trim();
  const color = colorRaw && HEX_COLOR_RE.test(colorRaw) ? colorRaw : null;

  const openInNewTab = formData.get("openInNewTab") !== "off"; // default checked

  const startRaw = String(formData.get("scheduledStart") ?? "").trim();
  const endRaw = String(formData.get("scheduledEnd") ?? "").trim();
  const scheduledStart = startRaw ? new Date(startRaw) : null;
  const scheduledEnd = endRaw ? new Date(endRaw) : null;

  if (scheduledStart && Number.isNaN(scheduledStart.getTime())) {
    return { error: "Tanggal mulai jadwal tidak valid." };
  }
  if (scheduledEnd && Number.isNaN(scheduledEnd.getTime())) {
    return { error: "Tanggal berakhir jadwal tidak valid." };
  }
  if (scheduledStart && scheduledEnd && scheduledStart >= scheduledEnd) {
    return { error: "Tanggal berakhir harus setelah tanggal mulai." };
  }

  const password = String(formData.get("password") ?? "");
  const clearPassword = formData.get("clearPassword") === "on";

  let passwordUpdate: { set: string | null } | null = null;
  if (clearPassword) {
    passwordUpdate = { set: null };
  } else if (password) {
    if (password.length < 4) {
      return { error: "Password link minimal 4 karakter." };
    }
    passwordUpdate = { set: await bcrypt.hash(password, 10) };
  }

  return { description, color, scheduledStart, scheduledEnd, openInNewTab, passwordUpdate };
}

/**
 * Create atau update satu tombol link. Memakai `id` (hidden field) untuk
 * membedakan keduanya, persis pola yang sudah dipakai form-form CMS admin
 * (lihat app/dashboard/admin/content/ecosystem/actions.ts) — supaya satu
 * komponen form bisa dipakai untuk "Tambah" maupun "Edit".
 */
export async function upsertProfileLink(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const id = String(formData.get("id") ?? "").trim() || null;
  const label = sanitizeLinkLabel(String(formData.get("label") ?? ""));
  const url = String(formData.get("url") ?? "").trim();
  const icon = String(formData.get("icon") ?? "link").trim();

  const validationError = getProfileLinkError(label, url);
  if (validationError) {
    return { error: validationError };
  }

  const extra = await parseExtraLinkFields(formData);
  if ("error" in extra) {
    return { error: extra.error };
  }

  try {
    if (id) {
      // Edit — pastikan link ini benar-benar milik user yang sedang login,
      // bukan cuma percaya id yang dikirim dari client.
      const existing = await prisma.profileLink.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing || existing.userId !== userId) {
        return { error: "Link tidak ditemukan." };
      }

      const updated = await prisma.profileLink.update({
        where: { id },
        data: {
          label,
          url,
          icon,
          description: extra.description,
          color: extra.color,
          scheduledStart: extra.scheduledStart,
          scheduledEnd: extra.scheduledEnd,
          openInNewTab: extra.openInNewTab,
          ...(extra.passwordUpdate ? { passwordHash: extra.passwordUpdate.set } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.LINK_UPDATE,
          entityType: "ProfileLink",
          entityId: id,
          metadata: { label },
        },
      });

      await revalidateOwnerPaths(userId);
      // Kembalikan object ProfileLink LENGKAP hasil Prisma (termasuk
      // createdAt/updatedAt/visible/clicks/dst), bukan potongan 4 field.
      return { success: true, link: updated };
    } else {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, plan: true, _count: { select: { links: true } } },
      });

      if (
        dbUser &&
        !hasPremiumAccess(dbUser) &&
        dbUser._count.links >= FREE_LINK_LIMIT
      ) {
        return {
          error: `Akun gratis maksimal ${FREE_LINK_LIMIT} tombol link. Upgrade ke Premium untuk link tanpa batas.`,
        };
      }

      const maxOrder = await prisma.profileLink.aggregate({
        where: { userId },
        _max: { order: true },
      });

      const created = await prisma.profileLink.create({
        data: {
          userId,
          label,
          url,
          icon,
          order: (maxOrder._max.order ?? -1) + 1,
          description: extra.description,
          color: extra.color,
          scheduledStart: extra.scheduledStart,
          scheduledEnd: extra.scheduledEnd,
          openInNewTab: extra.openInNewTab,
          passwordHash: extra.passwordUpdate?.set ?? null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.LINK_CREATE,
          entityType: "ProfileLink",
          entityId: created.id,
          metadata: { label },
        },
      });

      await revalidateOwnerPaths(userId);
      // `created` sudah merupakan object ProfileLink lengkap hasil Prisma —
      // kembalikan langsung, jangan direkonstruksi ulang jadi subset field.
      return { success: true, link: created };
    }
  } catch (error) {
    console.error("[PROFILE_LINK_UPSERT_ERROR]", error);
    return { error: "Gagal menyimpan link. Coba lagi." };
  }
}

export async function deleteProfileLink(id: string): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const existing = await prisma.profileLink.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return { error: "Link tidak ditemukan." };
  }

  await prisma.profileLink.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: AuditAction.LINK_DELETE,
      entityType: "ProfileLink",
      entityId: id,
    },
  });

  await revalidateOwnerPaths(userId);
  return { success: true };
}

export async function toggleProfileLinkVisible(
  id: string,
  visible: boolean
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const existing = await prisma.profileLink.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return { error: "Link tidak ditemukan." };
  }

  await prisma.profileLink.update({
    where: { id },
    data: { visible },
  });

  await revalidateOwnerPaths(userId);
  return { success: true };
}

/**
 * Simpan urutan baru hasil drag-and-drop. Menerima daftar id TERURUT milik
 * user yang login — sebelum dieksekusi, divalidasi dulu semua id memang
 * kepunyaan user ini, supaya satu user tidak bisa mengubah urutan link
 * milik user lain dengan menebak/mengirim id asing.
 */
export async function reorderProfileLinks(
  orderedIds: string[]
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const owned = await prisma.profileLink.findMany({
    where: { userId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((l) => l.id));

  if (
    orderedIds.length !== ownedIds.size ||
    !orderedIds.every((id) => ownedIds.has(id))
  ) {
    return { error: "Data link tidak valid." };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.profileLink.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  await revalidateOwnerPaths(userId);
  return { success: true };
}