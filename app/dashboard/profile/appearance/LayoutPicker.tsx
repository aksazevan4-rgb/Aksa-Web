"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Check, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { updateProfileLayout } from "./actions";
import { PROFILE_LAYOUTS, PROFILE_THEMES } from "@/lib/profile-themes";

interface Props {
  currentLayout: string;
  currentTheme: string;
  accessibleFeatures: string[];
}

export function LayoutPicker({ currentLayout, currentTheme, accessibleFeatures }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileLayout, {});
  const [selectedLayout, setSelectedLayout] = useState(currentLayout);

  return (
    <div className="space-y-6">
      {/* Layout selection */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Layout</h3>
        <p className="text-xs text-text-tertiary -mt-2">
          Susunan struktural halaman profilmu.
        </p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="layout" value={selectedLayout} />

          <div className="grid sm:grid-cols-2 gap-3">
            {PROFILE_LAYOUTS.map((layout) => {
              const locked =
                layout.premiumFeatureKey && !accessibleFeatures.includes(layout.premiumFeatureKey);
              const selected = selectedLayout === layout.key;

              return (
                <button
                  key={layout.key}
                  type="button"
                  disabled={Boolean(locked)}
                  onClick={() => setSelectedLayout(layout.key)}
                  className={`relative text-left rounded-2xl border p-4 transition-all ${
                    selected
                      ? "border-purple/50 bg-purple/8"
                      : "border-border bg-white/3 hover:border-border/80"
                  } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {/* Mini layout preview */}
                  <LayoutPreview layoutKey={layout.key} />

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-medium text-text-primary">{layout.label}</p>
                    {locked ? (
                      <Crown size={13} className="text-amber-300" />
                    ) : selected ? (
                      <span className="h-4 w-4 rounded-full bg-purple text-white flex items-center justify-center">
                        <Check size={10} />
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
                    {layout.description}
                  </p>
                </button>
              );
            })}
          </div>

          {state.error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || selectedLayout === currentLayout}
            className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            Terapkan Layout
          </button>

          {state.success && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 ml-3">
              <CheckCircle2 size={13} />
              Layout diterapkan
            </span>
          )}
        </form>
      </div>

      {/* Theme color selection */}
      <ThemePicker currentTheme={currentTheme} accessibleFeatures={accessibleFeatures} />
    </div>
  );
}

function LayoutPreview({ layoutKey }: { layoutKey: string }) {
  const base = "h-20 rounded-lg bg-white/5 border border-border/60 p-2 flex flex-col gap-1.5";

  switch (layoutKey) {
    case "modern":
      return (
        <div className={base}>
          <div className="h-5 rounded bg-purple/20" />
          <div className="flex-1 flex gap-1">
            <div className="flex-1 rounded bg-white/8" />
            <div className="flex-1 rounded bg-white/8" />
          </div>
        </div>
      );
    case "glass":
      return (
        <div className={`${base} backdrop-blur`}>
          <div className="mx-auto h-6 w-6 rounded-full bg-purple/30" />
          <div className="h-2 w-2/3 mx-auto rounded bg-white/10" />
          <div className="flex-1 rounded bg-white/5 border border-white/10" />
        </div>
      );
    case "minimal":
      return (
        <div className={base}>
          <div className="mx-auto h-4 w-4 rounded-full bg-white/15" />
          <div className="h-1.5 w-1/2 mx-auto rounded bg-white/10" />
          <div className="h-1.5 w-2/3 mx-auto rounded bg-white/10" />
        </div>
      );
    case "compact":
      return (
        <div className={base}>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-purple/30 flex-shrink-0" />
            <div className="h-1.5 flex-1 rounded bg-white/10" />
          </div>
          <div className="h-1.5 rounded bg-white/8" />
          <div className="h-1.5 rounded bg-white/8" />
          <div className="h-1.5 rounded bg-white/8" />
        </div>
      );
    case "fullwidth":
      return (
        <div className={base}>
          <div className="h-2.5 rounded bg-purple/20" />
          <div className="flex-1 flex gap-1">
            <div className="w-5 rounded bg-white/10" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex-1 rounded bg-white/8" />
              <div className="flex-1 rounded bg-white/8" />
            </div>
          </div>
        </div>
      );
    case "creator":
      return (
        <div className={base}>
          <div className="h-6 rounded bg-purple/15 -mx-2 -mt-2" />
          <div className="flex items-center gap-1 -mt-3">
            <div className="h-5 w-5 rounded-full bg-purple/35 border border-bg flex-shrink-0" />
            <div className="h-1.5 flex-1 rounded bg-white/10" />
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-6 rounded-full bg-white/10" />
            <div className="h-2 w-6 rounded-full bg-white/10" />
          </div>
        </div>
      );
    case "showcase":
      return (
        <div className={`${base} bg-gradient-to-br from-purple/15 via-white/5 to-black items-center justify-center`}>
          <div className="rounded-lg border border-white/15 bg-black/40 backdrop-blur px-2 py-1.5 flex flex-col items-center gap-1 w-4/5">
            <div className="h-3.5 w-3.5 rounded-full bg-purple/40" />
            <div className="h-1 w-2/3 rounded bg-white/20" />
            <div className="flex gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
              <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className={base}>
          <div className="mx-auto h-6 w-6 rounded-full bg-purple/25" />
          <div className="h-2 w-1/2 mx-auto rounded bg-white/10" />
          <div className="flex-1 flex flex-col gap-1 mt-1">
            <div className="h-2.5 rounded bg-white/8" />
            <div className="h-2.5 rounded bg-white/8" />
          </div>
        </div>
      );
  }
}

function ThemePicker({
  currentTheme,
  accessibleFeatures,
}: {
  currentTheme: string;
  accessibleFeatures: string[];
}) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Warna Tema</h3>
      <p className="text-xs text-text-tertiary -mt-2">
        Diatur dari halaman Profil Saya (field &quot;Tema Profil Publik&quot;).
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {PROFILE_THEMES.map((theme) => {
          const locked =
            theme.premiumFeatureKey && !accessibleFeatures.includes(theme.premiumFeatureKey);
          const active = currentTheme === theme.key;

          return (
            <div
              key={theme.key}
              className={`relative rounded-xl border p-2.5 ${
                active ? "border-purple/50" : "border-border"
              } ${locked ? "opacity-50" : ""}`}
            >
              <div
                className={`h-10 rounded-lg bg-gradient-to-br ${theme.bannerClass}`}
              />
              <p className="text-[10px] text-text-secondary mt-1.5 truncate">{theme.label}</p>
              {locked && (
                <Crown size={10} className="absolute top-1.5 right-1.5 text-amber-300" />
              )}
              {active && (
                <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-purple text-white flex items-center justify-center">
                  <Check size={8} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
