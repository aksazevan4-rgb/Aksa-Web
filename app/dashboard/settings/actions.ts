"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getPasswordError, isValidEmail } from "@/lib/validation";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { createToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { sendEmail, buildVerifyEmailTemplate, buildEmailChangeTemplate } from "@/lib/mail";
import { getSiteConfig } from "@/lib/site-config";

interface ActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function setNotifyGuestbookEmail(enabled: boolean): Promise<ActionResult> {
  const session = await verifySession();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { notifyGuestbookEmail: enabled },
  });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

const EMAIL_VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 jam
const EMAIL_CHANGE_EXPIRY_MS = 60 * 60 * 1000; // 1 jam

/**
 * Kirim ulang email verifikasi untuk email akun yang sekarang (bukan
 * email baru — itu ditangani requestEmailChange di bawah).
 */
export async function resendVerificationEmail(): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const { allowed } = checkRateLimit(`resend-verify:${userId}`, {
    windowMs: 15 * 60 * 1000,
    max: 3,
  });
  if (!allowed) {
    return { error: "Terlalu banyak percobaan. Coba lagi nanti." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email) return { error: "Akun tidak punya email." };
  if (user.emailVerified) return { error: "Email sudah terverifikasi." };

  const token = await createToken(TOKEN_PURPOSE.EMAIL_VERIFY, user.email, EMAIL_VERIFY_EXPIRY_MS);
  const config = await getSiteConfig();
  const verifyUrl = `${config.siteUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  const { html, text } = buildVerifyEmailTemplate(config.siteName, verifyUrl);
  const result = await sendEmail({ to: user.email, subject: `Verifikasi email — ${config.siteName}`, html, text });

  if (!result.success) return { error: "Gagal mengirim email. Coba lagi nanti." };

  return { success: true, message: "Email verifikasi terkirim. Cek inbox kamu." };
}

/**
 * Minta ganti email. Tautan konfirmasi dikirim ke email BARU (bukan email
 * lama) — memastikan pemilik akun benar-benar punya akses ke alamat baru
 * itu sebelum kita ganti apa pun di database.
 */
export async function requestEmailChange(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const newEmail = String(formData.get("newEmail") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!newEmail || !isValidEmail(newEmail)) {
    return { error: "Format email baru tidak valid." };
  }

  const { allowed } = checkRateLimit(`email-change:${userId}`, {
    windowMs: 15 * 60 * 1000,
    max: 3,
  });
  if (!allowed) {
    return { error: "Terlalu banyak percobaan. Coba lagi nanti." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, password: true },
  });
  if (!dbUser) return { error: "Akun tidak ditemukan." };

  if (newEmail === dbUser.email) {
    return { error: "Itu email yang sedang kamu pakai sekarang." };
  }

  // Verifikasi password kalau akun ini punya password (credentials) —
  // mencegah orang lain mengganti email akun cuma karena sesi browser
  // sedang login (mis. laptop bersama / sesi lupa logout).
  if (dbUser.password) {
    if (!currentPassword) {
      return { error: "Masukkan password saat ini untuk konfirmasi." };
    }
    const matches = await bcrypt.compare(currentPassword, dbUser.password);
    if (!matches) return { error: "Password salah." };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) {
    return { error: "Email itu sudah dipakai akun lain." };
  }

  const key = `${userId}:${newEmail}`;
  const token = await createToken(TOKEN_PURPOSE.EMAIL_CHANGE, key, EMAIL_CHANGE_EXPIRY_MS);
  const config = await getSiteConfig();
  const confirmUrl = `${config.siteUrl}/confirm-email-change?token=${token}&uid=${userId}&email=${encodeURIComponent(newEmail)}`;
  const { html, text } = buildEmailChangeTemplate(config.siteName, confirmUrl, newEmail);
  const result = await sendEmail({ to: newEmail, subject: `Konfirmasi email baru — ${config.siteName}`, html, text });

  if (!result.success) {
    return { error: "Gagal mengirim email konfirmasi. Coba lagi nanti." };
  }

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: AuditAction.EMAIL_CHANGE_REQUEST,
      entityType: "User",
      entityId: userId,
      metadata: { newEmail },
    },
  });

  return {
    success: true,
    message: `Tautan konfirmasi sudah dikirim ke ${newEmail}. Buka email itu untuk menyelesaikan penggantian.`,
  };
}

export async function changePassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const rateLimitKey = `change-password:${userId}`;
  const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return {
      error: `Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`,
    };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!dbUser) {
    return { error: "Akun tidak ditemukan." };
  }

  // User OAuth-only (belum pernah set password) — minta mereka membuat
  // password baru tanpa perlu "current password" karena memang belum ada.
  const hasExistingPassword = Boolean(dbUser.password);

  if (hasExistingPassword) {
    if (!currentPassword) {
      return { error: "Masukkan password saat ini." };
    }
    const matches = await bcrypt.compare(currentPassword, dbUser.password!);
    if (!matches) {
      return { error: "Password saat ini salah." };
    }
  }

  const passwordError = getPasswordError(newPassword);
  if (passwordError) {
    return { error: passwordError };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password baru tidak cocok." };
  }
  if (hasExistingPassword && currentPassword === newPassword) {
    return { error: "Password baru tidak boleh sama dengan password lama." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword, passwordUpdatedAt: new Date() },
  });

  resetRateLimit(rateLimitKey);
  revalidatePath("/dashboard/settings");

  return { success: true };
}

/**
 * "Logout All Devices" — karena strategi sesi di project ini adalah JWT
 * stateless (bukan database session), kita tidak bisa langsung "menghapus
 * sesi" seperti pada strategi database. Sebagai gantinya, kita menandai
 * SEMUA baris ActiveToken milik user sebagai revoked. Callback `jwt()` di
 * lib/auth.ts mengecek status revoked ini di setiap request lewat field
 * `jti` yang disisipkan ke token — begitu revoked, token ditolak meskipun
 * secara kriptografis masih valid sampai expiry aslinya.
 *
 * Device yang dipakai untuk klik tombol ini SENGAJA ikut ter-revoke juga
 * (logout total, termasuk sesi sekarang) supaya perilakunya jelas dan
 * tidak membingungkan — user yang ingin tetap login di device ini perlu
 * login ulang setelahnya, sama seperti "logout semua lalu masuk lagi".
 */
export async function logoutAllDevices(): Promise<ActionResult> {
  const session = await verifySession();

  await prisma.activeToken.updateMany({
    where: { userId: session.user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

/**
 * Hapus akun permanen. Pengamanan:
 * - User dengan password (credentials): wajib masukkan password untuk
 *   konfirmasi, sama seperti flow ubah password.
 * - User OAuth-only (tanpa password): wajib mengetik ulang teks konfirmasi
 *   persis, karena tidak ada password untuk diverifikasi.
 * - ADMIN tidak bisa menghapus dirinya sendiri kalau dia adalah SATU-
 *   SATUNYA admin yang aktif di sistem — mencegah situasi tanpa admin
 *   sama sekali yang tidak bisa diperbaiki tanpa akses database langsung.
 */
export async function deleteAccount(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifySession();
  const userId = session.user.id;

  const password = String(formData.get("password") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, role: true, email: true },
  });
  if (!dbUser) return { error: "Akun tidak ditemukan." };

  if (dbUser.password) {
    if (!password) return { error: "Masukkan password untuk konfirmasi." };
    const matches = await bcrypt.compare(password, dbUser.password);
    if (!matches) return { error: "Password salah." };
  } else {
    if (confirmText !== "HAPUS AKUN SAYA") {
      return {
        error:
          'Ketik "HAPUS AKUN SAYA" untuk konfirmasi (tanpa password karena akun ini login via OAuth).',
      };
    }
  }

  if (dbUser.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        error:
          "Tidak bisa menghapus akun ini karena ini satu-satunya admin yang aktif. Jadikan user lain admin dulu sebelum menghapus akun ini.",
      };
    }
  }

  // Revoke semua sesi aktif dulu (best-effort, sebelum baris User-nya
  // sendiri terhapus lewat cascade) supaya tidak ada token yang masih
  // "valid" secara kriptografis nyangkut walau user-nya sudah tidak ada.
  await prisma.activeToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: null, // actorId akan ikut terhapus sebentar lagi lewat cascade, simpan email di metadata
      action: AuditAction.USER_DELETE,
      entityType: "User",
      entityId: userId,
      metadata: { email: dbUser.email, selfDeleted: true },
    },
  });

  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
}
