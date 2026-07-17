"use client";

import { Crown, CheckCircle2, Clock, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Props {
  plan: "FREE" | "PREMIUM";
  role: "ADMIN" | "USER";
  premiumSince: string | null;
  premiumExpiresAt: string | null;
}

export function PremiumSection({ plan, role, premiumSince, premiumExpiresAt }: Props) {
  const isPremium = plan === "PREMIUM" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  if (isAdmin) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center text-blue flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Admin — Akses Penuh</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Akun admin memiliki akses ke semua fitur tanpa batasan.
          </p>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Crown size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              Premium Aktif
              <CheckCircle2 size={14} className="text-emerald-400" />
            </p>
            {premiumSince && (
              <p className="text-xs text-text-tertiary mt-0.5">
                Aktif sejak {new Date(premiumSince).toLocaleDateString("id-ID", { dateStyle: "long" })}
              </p>
            )}
          </div>
        </div>

        {premiumExpiresAt && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-400/8 border border-amber-400/20 rounded-xl px-3 py-2">
            <Clock size={13} className="flex-shrink-0" />
            Berakhir pada{" "}
            {new Date(premiumExpiresAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
          </div>
        )}

        {!premiumExpiresAt && (
          <p className="text-xs text-text-tertiary">
            Akses Premium tidak terbatas waktu.
          </p>
        )}
      </div>
    );
  }

  // Free plan — show upgrade prompt
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-border flex items-center justify-center text-text-tertiary flex-shrink-0">
          <Crown size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Paket Gratis</p>
          <p className="text-xs text-text-tertiary mt-0.5">Upgrade untuk fitur lebih lengkap.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          "Link tak terbatas",
          "Discord activity real-time",
          "Layout & background premium",
          "Hapus Powered by AKSA",
          "Spotify now playing",
          "Custom CSS",
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Sparkles size={11} className="text-purple flex-shrink-0" />
            {benefit}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <a
          href="https://discord.gg/aksaid"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors"
        >
          <Crown size={14} />
          Upgrade ke Premium
          <ExternalLink size={12} className="opacity-70" />
        </a>
        <Link href="/#pricing" className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          Lihat harga →
        </Link>
      </div>

      <p className="text-[11px] text-text-tertiary">
        Hubungi admin via Discord untuk proses upgrade.
        Setelah dikonfirmasi, akses Premium langsung aktif dari dashboard ini.
      </p>
    </div>
  );
}
