"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { changePassword } from "@/app/dashboard/settings/actions";

export function PasswordChangeForm({
  hasExistingPassword,
}: {
  hasExistingPassword: boolean;
}) {
  const [state, formAction, isPending] = useActionState(changePassword, {});

  return (
    <form action={formAction} className="space-y-4">
      {hasExistingPassword && (
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs text-text-tertiary mb-1.5"
          >
            Password Saat Ini
          </label>
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            autoComplete="current-password"
          />
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-xs text-text-tertiary mb-1.5">
          Password Baru
        </label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs text-text-tertiary mb-1.5"
        >
          Konfirmasi Password Baru
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} />
          Password berhasil diubah.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending && <Loader2 size={15} className="animate-spin" />}
        {hasExistingPassword ? "Ubah Password" : "Buat Password"}
      </button>
    </form>
  );
}
