"use server";

import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { isValidEmail } from "@/lib/validation";
import { createTrustedDeviceToken } from "@/lib/trusted-device";
import { TRUSTED_DEVICE_COOKIE_NAME } from "@/lib/trusted-device-token";

export interface LoginFormState {
  error?: string;
  /** docs/05-auth-system.md §2 — sinyal ke form untuk menampilkan input
   * kode 2FA/recovery code, tanpa memperlakukannya sebagai error biasa. */
  needsTwoFactor?: boolean;
}

export async function loginWithCredentials(
  _prevState: LoginFormState | undefined,
  formData: FormData
): Promise<LoginFormState | undefined> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = String(formData.get("remember") ?? "") === "true";
  const code = String(formData.get("code") ?? "").trim();
  const totpCode = /^\d{6}$/.test(code) ? code : "";
  const recoveryCode = code && !totpCode ? code : "";
  const trustDevice = String(formData.get("trustDevice") ?? "") === "true";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  if (!isValidEmail(email)) {
    return { error: "Format email tidak valid." };
  }

  try {
    // docs/05-auth-system.md §3 — Trusted Device. `redirect: false` supaya
    // kita bisa mengeset cookie "percaya perangkat ini" SETELAH login
    // (termasuk 2FA) benar-benar berhasil, sebelum redirect manual di
    // bawah. Sebelumnya (tanpa fitur trusted device) signIn() langsung
    // redirect sendiri lewat redirectTo; sekarang redirect dilakukan
    // manual supaya ada titik untuk menyisipkan logic cookie ini.
    await signIn("credentials", {
      email,
      password,
      remember: remember ? "true" : "false",
      totpCode: totpCode || undefined,
      recoveryCode: recoveryCode || undefined,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const cause = error.cause as { err?: Error } | undefined;
      const originalMessage = cause?.err?.message;

      if (originalMessage === "2FA_REQUIRED") {
        return { needsTwoFactor: true };
      }
      if (originalMessage === "2FA_INVALID") {
        return { needsTwoFactor: true, error: "Kode 2FA salah, coba lagi." };
      }

      if (originalMessage?.includes("Terlalu banyak percobaan")) {
        return { error: originalMessage };
      }

      return { error: "Email atau password salah." };
    }

    throw error;
  }

  // Login berhasil (termasuk lolos 2FA kalau aktif). Kalau user mencentang
  // "percaya perangkat ini", buat token trusted-device SEKARANG — bukan
  // sebelumnya, supaya token ini hanya pernah ada untuk login yang sudah
  // benar-benar tervalidasi penuh (docs/05 §3).
  if (trustDevice && (totpCode || recoveryCode)) {
    try {
      const session = await auth();
      if (session?.user?.id) {
        const userAgent = (await headers()).get("user-agent") ?? undefined;
        const token = await createTrustedDeviceToken(session.user.id, userAgent);
        const cookieStore = await cookies();
        cookieStore.set(TRUSTED_DEVICE_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 hari
        });
      }
    } catch (error) {
      // Gagal membuat trusted-device token TIDAK BOLEH menggagalkan login
      // yang sudah berhasil — cukup dicatat, user tetap lanjut ke
      // dashboard dan akan diminta 2FA lagi di login berikutnya (fail-safe,
      // bukan fail-open).
      console.error("[TRUSTED_DEVICE_CREATE_ERROR]", error);
    }
  }

  redirect("/dashboard");
}