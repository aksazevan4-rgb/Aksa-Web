"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPasswordError } from "@/lib/validation";
import { consumeToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { AuditAction } from "@prisma/client";

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPassword(
  _prevState: ResetPasswordState | undefined,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !email) {
    return { error: "Tautan reset tidak valid." };
  }

  const passwordError = getPasswordError(password);
  if (passwordError) {
    return { error: passwordError };
  }
  if (password !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  const valid = await consumeToken(TOKEN_PURPOSE.PASSWORD_RESET, email, token);
  if (!valid) {
    return { error: "Tautan reset sudah kedaluwarsa atau tidak valid. Minta tautan baru." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Akun tidak ditemukan." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Keamanan: putuskan semua sesi aktif lain setelah password direset,
  // supaya kalau ada pihak lain yang sedang login (mis. karena akun
  // dibobol), mereka otomatis ter-logout. Pola sama seperti logoutAllDevices.
  await prisma.activeToken
    .updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    .catch(() => {});

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: AuditAction.PASSWORD_RESET_COMPLETE,
      entityType: "User",
      entityId: user.id,
    },
  });

  return { success: true };
}
