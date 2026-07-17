"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { loginWithCredentials } from "@/app/login/actions";

export function CredentialsLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginWithCredentials,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="email"
          className="block text-xs text-text-secondary mb-1.5"
        >
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
        <label
          htmlFor="password"
          className="block text-xs text-text-secondary mb-1.5"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            name="remember"
            value="true"
            defaultChecked
            className="h-3.5 w-3.5 rounded border-border bg-white/5 accent-purple"
          />
          Ingat saya
        </label>
        <Link
          href="/forgot-password"
          className="text-xs text-purple hover:text-purple-glow transition-colors"
        >
          Lupa password?
        </Link>
      </div>

      {state?.needsTwoFactor && (
        <div>
          <label
            htmlFor="code"
            className="block text-xs text-text-secondary mb-1.5"
          >
            Kode 2FA (dari aplikasi authenticator)
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            autoFocus
            className="w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors tracking-widest"
          />
          <p className="text-[11px] text-text-tertiary mt-1">
            Kehilangan akses ke authenticator? Masukkan salah satu recovery
            code kamu di kolom ini juga.
          </p>

          <label className="flex items-center gap-2 mt-3 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              name="trustDevice"
              value="true"
              className="h-3.5 w-3.5 rounded border-border accent-purple"
            />
            Percaya perangkat ini selama 30 hari (tidak akan diminta kode 2FA lagi di perangkat ini)
          </label>
        </div>
      )}

      {state?.error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple hover:bg-purple-dim disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium text-white transition-colors mt-1"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-xs text-text-tertiary text-center mt-1">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-purple hover:text-purple-glow transition-colors"
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}
