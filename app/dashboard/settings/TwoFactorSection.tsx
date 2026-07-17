"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import {
  startTwoFactorEnrollmentAction,
  confirmTwoFactorEnrollmentAction,
  disableTwoFactorAction,
} from "@/features/two-factor/server/actions";

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors tracking-widest";

/**
 * app/dashboard/settings/TwoFactorSection.tsx
 * docs/05-auth-system.md §2 — enrollment 2 langkah (mulai → scan QR →
 * konfirmasi 1 kode → recovery codes ditampilkan sekali), plus disable.
 */
export function TwoFactorSection({ enabled: initialEnabled }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [disableCode, setDisableCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleStart() {
    setError(null);
    setIsPending(true);
    try {
      const result = await startTwoFactorEnrollmentAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setQrDataUrl(result.data!.qrDataUrl);
    } finally {
      setIsPending(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const result = await confirmTwoFactorEnrollmentAction({ code: confirmCode });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRecoveryCodes(result.data!.recoveryCodes);
      setEnabled(true);
      setQrDataUrl(null);
      setConfirmCode("");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const result = await disableTwoFactorAction({ code: disableCode });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEnabled(false);
      setDisableCode("");
      setRecoveryCodes(null);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            enabled
              ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-300"
              : "bg-white/5 border-border text-text-tertiary"
          }`}
        >
          {enabled ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            2FA {enabled ? "Aktif" : "Nonaktif"}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Lapisan keamanan tambahan pakai aplikasi authenticator (Google
            Authenticator, Authy, dst).
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {recoveryCodes && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 space-y-2">
          <p className="text-xs font-medium text-amber-300">
            Simpan recovery codes ini — tiap kode sekali pakai, tidak akan ditampilkan lagi.
          </p>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-text-secondary">
            {recoveryCodes.map((c) => (
              <span key={c} className="bg-black/30 rounded px-2 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {!enabled && !qrDataUrl && (
        <button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          Aktifkan 2FA
        </button>
      )}

      {!enabled && qrDataUrl && (
        <form onSubmit={handleConfirm} className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL dari qrcode, bukan aset next/image */}
          <img src={qrDataUrl} alt="QR code 2FA" className="rounded-xl border border-border w-40 h-40" />
          <input
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value)}
            placeholder="Masukkan kode 6 digit dari aplikasi"
            inputMode="numeric"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            Konfirmasi & Aktifkan
          </button>
        </form>
      )}

      {enabled && (
        <form onSubmit={handleDisable} className="flex gap-2">
          <input
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            placeholder="Kode 6 digit untuk menonaktifkan"
            inputMode="numeric"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            Nonaktifkan
          </button>
        </form>
      )}
    </div>
  );
}
