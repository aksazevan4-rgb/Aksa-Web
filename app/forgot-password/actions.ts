"use server";

import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/validation";
import { createToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { sendEmail, buildResetPasswordTemplate } from "@/lib/mail";
import { getSiteConfig } from "@/lib/site-config";
import { checkRateLimit } from "@/lib/rate-limit";
import { AuditAction } from "@prisma/client";

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 jam

// Pesan ini SELALU sama baik email terdaftar atau tidak, supaya endpoint
// ini tidak bisa dipakai untuk menebak-nebak email mana yang punya akun.
const GENERIC_MESSAGE =
  "Kalau email tersebut terdaftar, kami sudah mengirim tautan reset password.";

export async function requestPasswordReset(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return "Format email tidak valid.";
  }

  const { allowed } = checkRateLimit(`forgot-password:${email}`, {
    windowMs: 15 * 60 * 1000,
    max: 3,
  });
  if (!allowed) {
    return GENERIC_MESSAGE;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Hanya kirim kalau user punya password (akun credentials). Akun yang
  // cuma pakai OAuth (GitHub/Discord) tidak punya password untuk direset.
  if (user?.password) {
    try {
      const token = await createToken(TOKEN_PURPOSE.PASSWORD_RESET, email, RESET_EXPIRY_MS);
      const config = await getSiteConfig();
      const resetUrl = `${config.siteUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      const { html, text } = buildResetPasswordTemplate(config.siteName, resetUrl);
      await sendEmail({ to: email, subject: `Reset password — ${config.siteName}`, html, text });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: AuditAction.PASSWORD_RESET_REQUEST,
          entityType: "User",
          entityId: user.id,
        },
      });
    } catch (error) {
      console.error("[FORGOT_PASSWORD_ERROR]", error);
    }
  }

  return GENERIC_MESSAGE;
}
