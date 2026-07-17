"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import { deleteFromCloudinary } from "@/lib/cloudinary";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function deleteMediaItem(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      profileAvatar: { select: { id: true } },
      projectCover: { select: { id: true, title: true } },
      settingsOg: { select: { id: true } },
    },
  });

  if (!media) return { error: "File tidak ditemukan." };

  const usageCount =
    (media.profileAvatar ? 1 : 0) +
    media.projectCover.length +
    (media.settingsOg ? 1 : 0);

  if (usageCount > 0) {
    return {
      error: `File ini masih dipakai di ${usageCount} tempat (avatar/cover/settings). Lepas dulu dari sana sebelum menghapus.`,
    };
  }

  await prisma.media.delete({ where: { id } });

  // Best-effort hapus dari Cloudinary juga — kalau gagal (mis. file
  // sebenarnya bukan dari Cloudinary, melainkan URL eksternal yang
  // di-paste), tidak masalah, baris DB-nya sudah terhapus duluan.
  if (media.url.includes("res.cloudinary.com")) {
    await deleteFromCloudinary(media.url);
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.MEDIA_DELETE,
      entityType: "Media",
      entityId: id,
      metadata: { publicId: media.publicId, url: media.url },
    },
  });

  revalidatePath("/dashboard/admin/content/media");

  return { success: true };
}
