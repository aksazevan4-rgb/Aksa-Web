"use client";

import { useActionState, useState } from "react";
import { Check, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { updateProfileFont } from "./actions";
import { PROFILE_FONTS } from "@/lib/profile-themes";

interface Props {
  currentFont: string;
  accessibleFeatures: string[];
}

export function FontPicker({ currentFont, accessibleFeatures }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileFont, {});
  const [selected, setSelected] = useState(currentFont);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Font</h3>
      <p className="text-xs text-text-tertiary -mt-2">
        Berlaku untuk nama, judul, dan seluruh teks di profil publikmu.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="font" value={selected} />

        <div className="grid sm:grid-cols-2 gap-3">
          {PROFILE_FONTS.map((font) => {
            const locked = font.premiumFeatureKey && !accessibleFeatures.includes(font.premiumFeatureKey);
            const active = selected === font.key;

            return (
              <button
                key={font.key}
                type="button"
                disabled={Boolean(locked)}
                onClick={() => setSelected(font.key)}
                className={`relative flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${
                  active ? "border-purple/50 bg-purple/8" : "border-border bg-white/3 hover:border-border/80"
                } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-base text-text-primary" style={{ fontFamily: font.fontFamily }}>
                  {font.label}
                </span>
                {locked ? (
                  <Crown size={13} className="text-amber-300 flex-shrink-0" />
                ) : active ? (
                  <span className="h-5 w-5 rounded-full bg-purple text-white flex items-center justify-center flex-shrink-0">
                    <Check size={11} />
                  </span>
                ) : null}
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
          disabled={isPending || selected === currentFont}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Terapkan Font
        </button>

        {state.success && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 ml-3">
            <CheckCircle2 size={13} />
            Font diterapkan
          </span>
        )}
      </form>
    </div>
  );
}
