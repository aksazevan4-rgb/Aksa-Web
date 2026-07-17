"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { deleteAccount } from "./actions";

export function DeleteAccountForm({
  hasExistingPassword,
}: {
  hasExistingPassword: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteAccount, {});

  useEffect(() => {
    if (state.success) {
      // Akun sudah terhapus di database — paksa keluar dari sesi client
      // (cookie) lalu kembali ke homepage. Tidak pakai signOut's
      // redirectTo langsung karena kita ingin pastikan local state bersih
      // dulu sebelum navigasi.
      signOut({ redirect: false }).then(() => {
        router.push("/");
        router.refresh();
      });
    }
  }, [state.success, router]);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <AlertTriangle size={15} />
        Hapus Akun Saya
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-300">
        Tindakan ini permanen dan tidak bisa dibatalkan. Semua data profil,
        riwayat login, dan sesi aktif akan terhapus.
      </div>

      {hasExistingPassword ? (
        <div>
          <label className="block text-xs text-text-tertiary mb-1.5">
            Masukkan password untuk konfirmasi
          </label>
          <PasswordInput id="delete-account-password" name="password" autoComplete="current-password" />
        </div>
      ) : (
        <div>
          <label
            htmlFor="confirmText"
            className="block text-xs text-text-tertiary mb-1.5"
          >
            Ketik <span className="font-mono text-red-300">HAPUS AKUN SAYA</span> untuk konfirmasi
          </label>
          <input
            id="confirmText"
            name="confirmText"
            required
            className="w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary outline-none focus:border-red-400/40"
          />
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          Hapus Permanen
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
