"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { resetPassword, type ResetPasswordState } from "@/app/reset-password/actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 flex items-start gap-2.5">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary">
          Password berhasil diubah. Mengarahkan ke halaman masuk...
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <div>
        <label htmlFor="password" className="block text-xs text-text-secondary mb-1.5">
          Password Baru
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          onChange={setPassword}
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs text-text-secondary mb-1.5">
          Konfirmasi Password Baru
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Ulangi password baru"
          autoComplete="new-password"
        />
      </div>

      {state.error && (
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
        {isPending ? "Menyimpan..." : "Reset Password"}
      </button>
    </form>
  );
}
