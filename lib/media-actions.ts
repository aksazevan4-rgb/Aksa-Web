"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import {
  uploadToCloudinary,
  getFileValidationError,
} from "@/lib/cloudinary";

interface UploadResult {
  error?: string;
  url?: string;
  mediaId?: string;
}

/**
 * Upload generik dipakai oleh semua form CMS (avatar, banner project,
 * gallery, dst). Setiap file yang masuk lewat sini SELALU dicatat juga
 * sebagai baris Media, supaya muncul di Media Manager terpusat — bukan
 * cuma tersimpan sebagai URL lepas di kolom masing-masing.
 *
 * `folder` menentukan sub-folder Cloudinary (mis. "avatars",
 * "project-banners", "project-gallery") untuk organisasi di dashboard
 * Cloudinary maupun filter di Media Manager.
 */
export async function uploadMedia(
  formData: FormData,
  folder: string
): Promise<UploadResult> {
  const session = await verifyAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Tidak ada file yang dipilih." };
  }

  const validationError = getFileValidationError(file);
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
    console.error("[MEDIA_UPLOAD_ERROR]", error);
    return { error: "Gagal mengupload file. Coba lagi." };
  }
}
