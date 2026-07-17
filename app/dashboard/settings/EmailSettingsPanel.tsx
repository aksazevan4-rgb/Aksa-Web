"use client";

import { useActionState, useState, useTransition } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import {
  resendVerificationEmail,
  requestEmailChange,
} from "@/app/dashboard/settings/actions";

export function EmailSettingsPanel({
  email,
  emailVerified,
  hasExistingPassword,
}: {
  email: string;
  emailVerified: boolean;
  hasExistingPassword: boolean;
}) {
  const [resendState, setResendState] = useState<{ error?: string; message?: string } | null>(null);
  const [isResending, startResend] = useTransition();
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeState, changeAction, isChanging] = useActionState(requestEmailChange, {});

  function handleResend() {
    startResend(async () => {
      const result = await resendVerificationEmail();
      setResendState(result);
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-text-primary">{email}</p>
          {emailVerified ? (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1">
              <CheckCircle2 size={13} />
              Terverifikasi
            </p>
          ) : (
            <p className="text-xs text-amber-300 flex items-center gap-1.5 mt-1">
              <AlertTriangle size={13} />
              Belum diverifikasi
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!emailVerified && (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-white/10 disabled:opacity-60 transition-colors"
            >
              {isResending && <Loader2 size={12} className="animate-spin" />}
              Kirim ulang verifikasi
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowChangeForm((v) => !v)}
            className="rounded-lg bg-white/5 border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-white/10 transition-colors"
          >
            Ganti Email
          </button>
        </div>
      </div>

      {resendState?.message && (
        <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
          {resendState.message}
        </p>
      )}
      {resendState?.error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {resendState.error}
        </p>
      )}

      {showChangeForm && (
        <form action={changeAction} className="space-y-3 pt-3 border-t border-border">
          <div>
            <label htmlFor="newEmail" className="block text-xs text-text-tertiary mb-1.5">
              Email Baru
            </label>
            <input
              id="newEmail"
              name="newEmail"
              type="email"
              required
              placeholder="email-baru@contoh.com"
              className="w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
            />
          </div>

          {hasExistingPassword && (
            <div>
              <label
                htmlFor="currentPasswordForEmail"
                className="block text-xs text-text-tertiary mb-1.5"
              >
                Password Saat Ini (konfirmasi)
              </label>
              <PasswordInput
                id="currentPasswordForEmail"
                name="currentPassword"
                autoComplete="current-password"
              />
            </div>
          )}

          {changeState.error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {changeState.error}
            </p>
          )}
          {changeState.success && (
            <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
              {changeState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isChanging}
            className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isChanging && <Loader2 size={15} className="animate-spin" />}
            Kirim Tautan Konfirmasi
          </button>
          <p className="text-[11px] text-text-tertiary">
            Kami akan kirim tautan konfirmasi ke email baru — email lama tetap
            aktif sampai kamu klik tautan itu.
          </p>
        </form>
      )}
    </div>
  );
}
