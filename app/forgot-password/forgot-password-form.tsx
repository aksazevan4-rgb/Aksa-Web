"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/app/forgot-password/actions";

export function ForgotPasswordForm() {
  const [message, formAction, isPending] = useActionState(
    requestPasswordReset,
    undefined
  );

  if (message) {
    return (
      <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-4 py-3 flex items-start gap-2.5">
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
    );
  }

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

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple hover:bg-purple-dim disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium text-white transition-colors mt-1"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? "Mengirim..." : "Kirim tautan reset"}
      </button>
    </form>
  );
}
