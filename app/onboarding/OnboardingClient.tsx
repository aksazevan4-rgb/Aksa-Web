"use client";

import { useState, useTransition } from "react";
import {
  User,
  Code2,
  Gamepad2,
  Clapperboard,
  Radio,
  PenTool,
  Briefcase,
  ShoppingBag,
  FolderKanban,
  Music,
  GraduationCap,
  Users,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { ONBOARDING_PRESETS } from "@/lib/onboarding-presets";
import { completeOnboarding, skipOnboarding } from "./actions";

const ICONS: Record<string, React.ElementType> = {
  User,
  Code2,
  Gamepad2,
  Clapperboard,
  Radio,
  PenTool,
  Briefcase,
  ShoppingBag,
  FolderKanban,
  Music,
  GraduationCap,
  Users,
};

interface Props {
  displayName: string;
}

export function OnboardingClient({ displayName }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(selected);
      if (result?.error) setError(result.error);
    });
  }

  function handleSkip() {
    startTransition(async () => {
      await skipOnboarding();
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8 relative">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full orb orb-purple opacity-20 pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-10 right-0 h-56 w-56 rounded-full orb orb-pink opacity-15 pointer-events-none"
        />

        <div className="text-center space-y-2 relative z-10">
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Halo, {displayName} 👋
          </h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Pilih tipe profil yang paling cocok denganmu. Kami akan siapkan
            layout, tema, dan widget awal secara otomatis — semua tetap bisa
            kamu ubah kapan saja nanti.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
          {ONBOARDING_PRESETS.map((preset) => {
            const Icon = ICONS[preset.icon] ?? User;
            const active = selected === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelected(preset.id)}
                className={`group relative flex flex-col items-start gap-2.5 rounded-2xl p-4 text-left transition-all duration-200 glass ${
                  active
                    ? "border-purple/50 bg-purple/10 -translate-y-0.5"
                    : "hover:border-purple/25 hover:-translate-y-0.5"
                }`}
              >
                {active && (
                  <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-purple flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </span>
                )}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-colors ${
                    active
                      ? "bg-purple/20 border-purple/40 text-purple"
                      : "bg-white/5 border-border text-text-secondary group-hover:text-purple"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5 leading-snug">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-xs text-red-400 relative z-10">{error}</p>
        )}

        <div className="flex items-center justify-center gap-3 relative z-10">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isPending}
            className="text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors px-4 py-2.5 disabled:opacity-50"
          >
            Lewati untuk sekarang
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-purple px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Buat Profil Saya
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
