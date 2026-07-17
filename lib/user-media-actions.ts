"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  uploadToCloudinary,
  getFileValidationError,
  type MediaKind,
} from "@/lib/cloudinary";

interface UploadResult {
  error?: string;
  url?: string;
  mediaId?: string;
}

/**
 * Folder Cloudinary yang boleh dipakai user biasa lewat upload sendiri.
 * Sengaja dibatasi ke whitelist ini (bukan string bebas seperti di
 * `uploadMedia` admin) supaya user tidak bisa menulis ke folder CMS lain
 * (mis. "project-gallery") lewat form profilnya sendiri. Setiap folder
 * dipetakan ke jenis media yang divalidasi (lihat MediaKind di
 * lib/cloudinary.ts) supaya video/audio/cursor tidak divalidasi seolah
 * gambar biasa.
 */
const SELF_UPLOAD_FOLDERS: Record<string, MediaKind> = {
  avatars: "image",
  banners: "image",
  "profile-backgrounds": "image", // overridden to "video" below when the file is actually a video
  cursors: "cursor",
  "background-audio": "audio",
};

/**
 * Versi `uploadMedia` (lib/media-actions.ts) untuk user biasa, bukan admin.
 * Dipakai di Profile Settings supaya user bisa upload foto profil/banner
 * sendiri dari device, bukan cuma tempel URL. Tetap dicatat sebagai baris
 * Media (uploadedById = diri sendiri) supaya konsisten dengan jejak upload
 * admin, dan tetap kena rate limit per user supaya tidak disalahgunakan
 * sebagai image-hosting gratis oleh satu akun.
 */
export async function uploadOwnMedia(
  folder: string,
  formData: FormData
): Promise<UploadResult> {
  const session = await verifySession();

  const baseKind = SELF_UPLOAD_FOLDERS[folder];
  if (!baseKind) {
    return { error: "Folder upload tidak valid." };
  }

  const rate = checkRateLimit(`upload:${session.user.id}`);
  if (!rate.allowed) {
    const minutes = Math.ceil(rate.retryAfterMs / 60000);
    return {
      error: `Terlalu banyak upload. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Tidak ada file yang dipilih." };
  }

  // "profile-backgrounds" accepts both image and video — pick the real
  // kind from the file itself rather than assuming image for everything.
  const kind: MediaKind =
    folder === "profile-backgrounds" && file.type.startsWith("video/") ? "video" : baseKind;

  const validationError = getFileValidationError(file, kind);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const uploaded = await uploadToCloudinary(file, folder);

    const media = await prisma.media.create({
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        format: uploaded.format,
        bytes: uploaded.bytes,
        width: uploaded.width,
        height: uploaded.height,
        uploaderId: session.user.id,
      },
    });

    return { url: media.url, mediaId: media.id };
  } catch (error) {
    console.error("[USER_MEDIA_UPLOAD_ERROR]", error);
    return { error: "Gagal mengupload file. Coba lagi." };
  }
}
