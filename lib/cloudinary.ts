import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
}

/**
 * Upload satu file (dari device, galeri, atau kamera — semuanya datang
 * sebagai File/Blob biasa di sisi browser) ke Cloudinary. Dipakai dari
 * Server Action: file diterima sebagai FormData di server, lalu di-upload
 * dari sini, BUKAN diproses dulu lewat client-side upload widget — supaya
 * API secret Cloudinary tidak pernah perlu dikirim ke browser.
 *
 * `folder` memisahkan jenis aset di dashboard Cloudinary (avatars,
 * banners, project-gallery, dst) supaya Media Manager nanti bisa
 * difilter per kategori dengan mudah.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<CloudinaryUploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  // Cloudinary has no dedicated "audio" resource type — audio files upload
  // under "video" (its transcoding pipeline handles both).
  const resourceType: "image" | "video" | "raw" = isImage ? "image" : isVideo || file.type.startsWith("audio/") ? "video" : "raw";

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `aksa-landing/${folder}`,
    resource_type: resourceType,
    // Batasi dimensi maksimum supaya foto langsung dari kamera HP (yang
    // sering 4000x3000px+) tidak tersimpan mentah-mentah di akun gratis.
    // "limit" artinya gambar yang lebih kecil dari ini TIDAK diperbesar,
    // hanya diperkecil kalau melebihi. Hanya berlaku untuk gambar — video
    // dan audio dikirim apa adanya, transformasi resize tidak relevan
    // (dan akan gagal/salah target kalau dipaksakan ke resource non-image).
    transformation: isImage ? [{ width: 2400, height: 2400, crop: "limit" }] : undefined,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type ?? "image",
    width: result.width ?? null,
    height: result.height ?? null,
    bytes: result.bytes,
    format: result.format,
  };
}

export async function deleteFromCloudinary(url: string): Promise<void> {
  // Public ID Cloudinary = path setelah /upload/v<version>/ sampai
  // sebelum ekstensi file. Kita ekstrak dari URL yang sudah tersimpan di
  // DB, supaya tidak perlu menyimpan publicId sebagai kolom terpisah.
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  if (!match) return;
  const publicId = match[1];

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Best-effort — kalau gagal hapus dari Cloudinary, jangan sampai
    // memblokir operasi hapus data di database kita.
    console.error("[CLOUDINARY_DELETE_ERROR]", error);
  }
}

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
export const ALLOWED_CURSOR_TYPES = ["image/png"];

/**
 * Shared ceiling for every self-service upload (avatar, banner, background
 * image/video, cursor, background audio). One generous limit instead of a
 * different cap per asset type — simplest mental model for users, and
 * media dashboards downstream (Cloudinary) enforce their own plan limits
 * regardless, so this is a UX guard rail, not the real backstop.
 *
 * NOTE: raising this doesn't by itself let 500MB uploads succeed end to
 * end — it also needs `experimental.serverActions.bodySizeLimit` in
 * next.config.ts raised to match (already done), and depends on the
 * Cloudinary plan's own per-file limit not being lower than this.
 */
export const MAX_UPLOAD_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

export type MediaKind = "image" | "video" | "audio" | "cursor";

const ALLOWED_TYPES_BY_KIND: Record<MediaKind, string[]> = {
  image: ALLOWED_IMAGE_TYPES,
  video: ALLOWED_VIDEO_TYPES,
  audio: ALLOWED_AUDIO_TYPES,
  cursor: ALLOWED_CURSOR_TYPES,
};

const KIND_LABEL: Record<MediaKind, string> = {
  image: "JPG, PNG, WEBP, atau GIF",
  video: "MP4 atau WEBM",
  audio: "MP3, OGG, atau WAV",
  cursor: "PNG",
};

/**
 * @param kind Defaults to "image" for backward compatibility with existing
 * callers (avatar/banner uploads). Pass "video" | "audio" | "cursor" for
 * background media, background audio, and custom cursor uploads.
 */
export function getFileValidationError(file: File, kind: MediaKind = "image"): string | null {
  if (!ALLOWED_TYPES_BY_KIND[kind].includes(file.type)) {
    return `Format file tidak didukung. Gunakan ${KIND_LABEL[kind]}.`;
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `Ukuran file maksimal ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB.`;
  }
  return null;
}
