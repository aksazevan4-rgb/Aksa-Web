"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { isValidEmail, getPasswordError, sanitizeName } from "@/lib/validation";
import { createToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { sendEmail, buildVerifyEmailTemplate } from "@/lib/mail";
import { getSiteConfig } from "@/lib/site-config";

const EMAIL_VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 jam

export async function registerUser(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const name = sanitizeName(String(formData.get("name") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name) {
    return "Nama wajib diisi.";
  }
  if (!email || !isValidEmail(email)) {
    return "Format email tidak valid.";
  }
  const passwordError = getPasswordError(password);
  if (passwordError) {
    return passwordError;
  }
  if (password !== confirmPassword) {
    return "Konfirmasi password tidak cocok.";
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    // Tidak bilang spesifik "email ini sudah ada lewat OAuth/credentials"
    // supaya tidak membantu enumerasi akun, tapi tetap jelas apa yang
    // harus dilakukan user.
    return "Email ini sudah terdaftar. Coba masuk, atau gunakan email lain.";
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  try {
    const token = await createToken(TOKEN_PURPOSE.EMAIL_VERIFY, email, EMAIL_VERIFY_EXPIRY_MS);
    const config = await getSiteConfig();
    const verifyUrl = `${config.siteUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const { html, text } = buildVerifyEmailTemplate(config.siteName, verifyUrl);
    await sendEmail({ to: email, subject: `Verifikasi email — ${config.siteName}`, html, text });
  } catch (error) {
    // Jangan gagalkan registrasi hanya karena email verifikasi gagal terkirim
    // — user tetap bisa minta kirim ulang dari halaman settings.
    console.error("[REGISTER_SEND_VERIFY_EMAIL_ERROR]", error);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      remember: "true",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Akun sudah dibuat di database, cuma auto-login-nya yang gagal
      // (kasus langka, mis. rate limit kebetulan kena). Arahkan user
      // untuk login manual daripada bikin dia bingung kena error di
      // tengah proses registrasi yang sebenarnya sudah sukses.
      return "Akun berhasil dibuat. Silakan masuk dengan email dan password kamu.";
    }
    throw error;
  }

  return undefined;
}
