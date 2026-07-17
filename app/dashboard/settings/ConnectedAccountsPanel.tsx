import { CheckCircle2 } from "lucide-react";

const PROVIDER_LABELS: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  discord: "Discord",
};

export function ConnectedAccountsPanel({ providers }: { providers: string[] }) {
  const known = Object.keys(PROVIDER_LABELS);

  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      {known.map((key) => {
        const linked = providers.includes(key);
        return (
          <div key={key} className="flex items-center justify-between py-1">
            <span className="text-sm text-text-secondary">{PROVIDER_LABELS[key]}</span>
            {linked ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 size={13} />
                Terhubung
              </span>
            ) : (
              <span className="text-xs text-text-tertiary">Belum terhubung</span>
            )}
          </div>
        );
      })}
      <p className="text-[11px] text-text-tertiary pt-1">
        Login lewat provider di atas dikelola oleh Auth.js. Untuk memutus koneksi,
        pastikan kamu sudah punya password akun aktif (lihat bagian Password di atas)
        supaya tidak terkunci dari akunmu sendiri.
      </p>
    </div>
  );
}
