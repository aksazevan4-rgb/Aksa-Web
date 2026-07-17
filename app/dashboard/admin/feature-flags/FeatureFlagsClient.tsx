"use client";

import { useState } from "react";
import { Loader2, Flag, Plus } from "lucide-react";
import { createFeatureFlagAction, updateFeatureFlagAction } from "@/features/feature-flags/server/actions";

interface FlagItem {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function FeatureFlagsClient({ flags: initialFlags }: { flags: FlagItem[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const result = await createFeatureFlagAction({ key: newKey.trim(), description: newDesc.trim() || undefined });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setFlags((prev) => [
        ...prev,
        { id: crypto.randomUUID(), key: newKey.trim(), description: newDesc.trim() || null, enabled: false, rolloutPercentage: 100 },
      ]);
      setNewKey("");
      setNewDesc("");
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggle(flag: FlagItem) {
    const nextEnabled = !flag.enabled;
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: nextEnabled } : f)));
    await updateFeatureFlagAction({ id: flag.id, enabled: nextEnabled, rolloutPercentage: flag.rolloutPercentage });
  }

  async function handleRolloutChange(flag: FlagItem, value: number) {
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, rolloutPercentage: value } : f)));
    await updateFeatureFlagAction({ id: flag.id, enabled: flag.enabled, rolloutPercentage: value });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-semibold text-xl text-text-primary flex items-center gap-2">
          <Flag size={18} className="text-purple" /> Feature Flags
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          Rollout fitur baru bertahap tanpa perlu deploy ulang (docs/14 §8).
        </p>
      </div>

      <form onSubmit={handleCreate} className="glass rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="key-flag-baru"
            className={inputClass}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Deskripsi singkat (opsional)"
            className={inputClass}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Buat Flag
        </button>
      </form>

      <div className="space-y-2">
        {flags.length === 0 && <p className="text-sm text-text-tertiary">Belum ada feature flag.</p>}
        {flags.map((flag) => (
          <div key={flag.id} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-mono text-text-primary truncate">{flag.key}</p>
                {flag.description && (
                  <p className="text-xs text-text-tertiary truncate">{flag.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleToggle(flag)}
                className={`flex-shrink-0 relative h-6 w-11 rounded-full transition-colors ${
                  flag.enabled ? "bg-purple" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    flag.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {flag.enabled && (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={flag.rolloutPercentage}
                  onChange={(e) => handleRolloutChange(flag, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-text-tertiary w-10 text-right">
                  {flag.rolloutPercentage}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
