"use client";

import { useState } from "react";
import { Loader2, KeyRound, Copy, Check, Trash2, BookOpen } from "lucide-react";
import { createApiKeyAction, revokeApiKeyAction } from "@/features/api-keys/server/actions";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors";

export function DeveloperClient({ keys: initialKeys }: { keys: ApiKeyItem[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Nama key wajib diisi.");
      return;
    }

    setIsPending(true);
    try {
      const result = await createApiKeyAction({ name: name.trim() });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRevealedToken(result.data!.rawToken);
      setName("");
      // Refresh ringan — tambahkan entri baru ke daftar tanpa perlu
      // full page reload (revalidatePath sudah jalan di server action,
      // ini cuma update optimis di client).
      setKeys((prev) => [
        {
          id: crypto.randomUUID(),
          name: result.data!.name,
          keyPrefix: result.data!.rawToken.split(".")[1]?.slice(0, 8) ?? "",
          lastUsedAt: null,
          revokedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setError("Terjadi kesalahan.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRevoke(keyId: string) {
    setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, revokedAt: new Date().toISOString() } : k)));
    await revokeApiKeyAction({ keyId });
  }

  async function handleCopy() {
    if (!revealedToken) return;
    await navigator.clipboard.writeText(revealedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">
            Developer / API
          </h1>
          <p className="text-sm text-text-tertiary">
            Buat API key untuk mengakses profil publikmu lewat API.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {revealedToken && (
            <div className="glass rounded-2xl p-4 border border-amber-400/30 space-y-2">
              <p className="text-xs font-medium text-amber-300">
                Simpan token ini sekarang — tidak akan ditampilkan lagi setelah ini.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-black/30 rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
                  {revealedToken}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-border hover:border-purple/40 text-text-secondary"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRevealedToken(null)}
                className="text-xs text-text-tertiary hover:text-text-primary"
              >
                Sudah disimpan, tutup pesan ini
              </button>
            </div>
          )}

          <form onSubmit={handleCreate} className="glass rounded-2xl p-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama key, mis. 'Portfolio bot'"
              className={`${inputClass} flex-1 min-w-0`}
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Buat Key
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="glass rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-semibold text-text-primary mb-1">API Keys Kamu</h3>
            {keys.length === 0 && (
              <p className="text-sm text-text-tertiary">Belum ada API key. Buat satu di atas.</p>
            )}
            {keys.map((k) => (
              <div
                key={k.id}
                className="rounded-xl bg-white/[0.02] border border-border px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {k.name}{" "}
                    <code className="text-[11px] text-text-tertiary ml-1">{k.keyPrefix}...</code>
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {k.revokedAt
                      ? "Dicabut"
                      : k.lastUsedAt
                        ? `Dipakai terakhir ${new Date(k.lastUsedAt).toLocaleDateString("id-ID")}`
                        : "Belum pernah dipakai"}
                  </p>
                </div>
                {!k.revokedAt && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-red-400 hover:bg-red-400/10"
                    title="Cabut key ini"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick API reference */}
        <div className="xl:sticky xl:top-24 glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <BookOpen size={15} className="text-purple" />
            Referensi Cepat
          </div>
          <p className="text-xs text-text-tertiary">
            Sertakan API key di header <code className="text-[11px] bg-white/5 px-1 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code>.
          </p>
          <div className="rounded-xl bg-black/30 border border-border p-3 space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-text-tertiary">Endpoint</p>
            <code className="block text-[11px] text-emerald-300 break-all">
              GET /api/public/v1/profile/[username]
            </code>
          </div>
          <p className="text-[11px] text-text-tertiary">
            Key yang dicabut tidak bisa dipakai lagi dan tidak bisa diaktifkan ulang — buat key baru jika perlu.
          </p>
        </div>
      </div>
    </main>
  );
}
