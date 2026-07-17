"use client";

import { useState } from "react";
import { Loader2, X, Coins, Award } from "lucide-react";
import { grantCreditsAction } from "@/features/premium/server/actions";
import { grantBadgeAction } from "@/features/badges/server/actions";

interface EditableUser {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
}

interface BadgeOption {
  id: string;
  name: string;
  category: string;
}

interface AdminEditUserModalProps {
  user: EditableUser;
  badges?: BadgeOption[];
  onClose: () => void;
  onSaved: (updated: EditableUser) => void;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function AdminEditUserModal({
  user,
  badges = [],
  onClose,
  onSaved,
}: AdminEditUserModalProps) {
  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Fase Admin Panel (docs/14-admin-panel.md §2) — Grant Credits, wajib
  // alasan (docs/12 §4), tercatat via AuditLog di grantCreditsAction.
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditPending, setCreditPending] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [creditSuccess, setCreditSuccess] = useState(false);

  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [badgeReason, setBadgeReason] = useState("");
  const [badgePending, setBadgePending] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const [badgeSuccess, setBadgeSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      onSaved({ id: user.id, name, username: username || null, bio: bio || null });
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleGrantCredits(e: React.FormEvent) {
    e.preventDefault();
    setCreditError(null);
    setCreditSuccess(false);

    const amount = Number(creditAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setCreditError("Jumlah credits harus angka bulat lebih dari 0.");
      return;
    }
    if (creditReason.trim().length < 4) {
      setCreditError("Alasan wajib diisi (minimal 4 karakter).");
      return;
    }

    setCreditPending(true);
    try {
      const result = await grantCreditsAction({ userId: user.id, amount, reason: creditReason.trim() });
      if (!result.success) {
        setCreditError(result.error);
        return;
      }
      setCreditSuccess(true);
      setCreditAmount("");
      setCreditReason("");
    } catch {
      setCreditError("Terjadi kesalahan.");
    } finally {
      setCreditPending(false);
    }
  }

  async function handleGrantBadge(e: React.FormEvent) {
    e.preventDefault();
    setBadgeError(null);
    setBadgeSuccess(false);

    if (!selectedBadgeId) {
      setBadgeError("Pilih badge dulu.");
      return;
    }
    if (badgeReason.trim().length < 4) {
      setBadgeError("Alasan wajib diisi (minimal 4 karakter).");
      return;
    }

    setBadgePending(true);
    try {
      const result = await grantBadgeAction({
        userId: user.id,
        badgeId: selectedBadgeId,
        reason: badgeReason.trim(),
      });
      if (!result.success) {
        setBadgeError(result.error);
        return;
      }
      setBadgeSuccess(true);
      setSelectedBadgeId("");
      setBadgeReason("");
    } catch {
      setBadgeError("Terjadi kesalahan.");
    } finally {
      setBadgePending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 my-8 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-text-tertiary hover:text-text-primary hover:bg-white/5"
        >
          <X size={16} />
        </button>

        <h2 className="font-display font-semibold text-lg text-text-primary">
          Edit Profil User
        </h2>
        <p className="text-xs text-text-tertiary">
          Perubahan ini dicatat di audit log sebagai aksi admin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Nama
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tanpa @"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-text-tertiary mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={280}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-purple px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Batal
            </button>
          </div>
        </form>

        {/* Grant Credits (docs/14-admin-panel.md §2, docs/12 §4) — terpisah
            dari form edit profil di atas karena ini Server Action lain,
            dengan audit trail sendiri (wajib alasan). */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-amber-300" />
            <h3 className="text-sm font-semibold text-text-primary">Grant Credits</h3>
          </div>

          <form onSubmit={handleGrantCredits} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="Jumlah"
                className={`${inputClass} w-28`}
              />
              <input
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="Alasan (wajib, tercatat di audit log)"
                className={inputClass}
              />
            </div>

            {creditError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                {creditError}
              </p>
            )}
            {creditSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                Credits berhasil diberikan.
              </p>
            )}

            <button
              type="submit"
              disabled={creditPending}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-300 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {creditPending && <Loader2 size={13} className="animate-spin" />}
              Beri Credits
            </button>
          </form>
        </div>

        {/* Grant Badge (docs/14-admin-panel.md §3, docs/10 §5) */}
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-purple" />
            <h3 className="text-sm font-semibold text-text-primary">Grant Badge</h3>
          </div>

          <form onSubmit={handleGrantBadge} className="space-y-3">
            <select
              value={selectedBadgeId}
              onChange={(e) => setSelectedBadgeId(e.target.value)}
              className={inputClass}
            >
              <option value="">Pilih badge...</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>

            <input
              value={badgeReason}
              onChange={(e) => setBadgeReason(e.target.value)}
              placeholder="Alasan (wajib, tercatat di audit log)"
              className={inputClass}
            />

            {badgeError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                {badgeError}
              </p>
            )}
            {badgeSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2">
                Badge berhasil diberikan.
              </p>
            )}

            <button
              type="submit"
              disabled={badgePending}
              className="inline-flex items-center gap-2 rounded-xl border border-purple/30 bg-purple/10 px-4 py-2 text-xs font-medium text-purple transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {badgePending && <Loader2 size={13} className="animate-spin" />}
              Beri Badge
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
