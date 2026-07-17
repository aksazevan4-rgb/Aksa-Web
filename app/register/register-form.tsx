"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { registerUser } from "@/app/register/actions";

export function RegisterForm() {
  const [error, formAction, isPending] = useActionState(
    registerUser,
    undefined
  );
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="name" className="block text-xs text-text-secondary mb-1.5">
          Nama
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Nama kamu"
          className="w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs text-text-secondary mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="kamu@email.com"
          className="w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs text-text-secondary mb-1.5">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          onChange={setPassword}
        />
        <PasswordStrengthMeter password={password} />
        <p className="text-[11px] text-text-tertiary mt-1.5">
          Minimal 8 karakter, kombinasi huruf besar, huruf kecil, dan angka.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs text-text-secondary mb-1.5"
        >
          Konfirmasi Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Ulangi password"
          autoComplete="new-password"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple hover:bg-purple-dim disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium text-white transition-colors mt-1"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? "Membuat akun..." : "Daftar"}
      </button>
    </form>
  );
}
