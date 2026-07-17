"use client";

import { useState, useTransition } from "react";
import { Link2, Plus, Trash2, Loader2 } from "lucide-react";
import { addAlias, removeAlias } from "./alias-actions";

interface AliasItem {
  id: string;
  alias: string;
}

export function AliasManager({
  initialAliases,
  profileHost,
  maxAliases,
}: {
  initialAliases: AliasItem[];
  profileHost: string;
  maxAliases: number;
}) {
  const [aliases, setAliases] = useState(initialAliases);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const atLimit = aliases.length >= maxAliases;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addAlias(value);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAliases((prev) => [...prev, { id: result.id!, alias: result.alias! }]);
      setValue("");
    });
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await removeAlias(id);
      if (result.success) {
        setAliases((prev) => prev.filter((a) => a.id !== id));
      }
    });
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Link2 size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Alias URL</h3>
        <span className="text-[11px] text-text-tertiary ml-auto">
          {aliases.length}/{maxAliases} dipakai
        </span>
      </div>
      <p className="text-xs text-text-tertiary">
        URL tambahan yang mengarah ke profil yang sama, cth. {profileHost}/nama-panggung.
      </p>

      {aliases.length > 0 && (
        <div className="space-y-2">
          {aliases.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-xl bg-white/3 border border-border px-3.5 py-2"
            >
              <span className="text-xs text-text-primary font-mono">
                {profileHost}/{a.alias}
              </span>
              <button
                onClick={() => handleRemove(a.id)}
                disabled={isPending}
                className="h-6 w-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="alias-baru"
            maxLength={20}
            className="flex-1 rounded-xl bg-white/5 border border-border px-3.5 py-2 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-purple/40"
          />
          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="rounded-xl bg-purple px-3.5 flex items-center justify-center text-white disabled:opacity-40"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </form>
      )}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
