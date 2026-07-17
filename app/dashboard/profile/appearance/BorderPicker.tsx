"use client";

import { useActionState, useState } from "react";
import { Check, Crown, Loader2, CheckCircle2 } from "lucide-react";
import { updateProfileBorder } from "./actions";
import { BORDER_STYLES, getAvatarBorderProps } from "@/lib/profile-themes";

interface Props {
  currentBorder: string;
  accentHex: string;
  accessibleFeatures: string[];
}

export function BorderPicker({ currentBorder, accentHex, accessibleFeatures }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileBorder, {});
  const [selected, setSelected] = useState(currentBorder);

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Border</h3>
      <p className="text-xs text-text-tertiary -mt-2">
        Gaya bingkai untuk avatar dan semua card/widget di profilmu. Warna mengikuti tema profil yang aktif.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="border" value={selected} />

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {BORDER_STYLES.map((border) => {
            const locked = border.premiumFeatureKey && !accessibleFeatures.includes(border.premiumFeatureKey);
            const active = selected === border.key;
            const preview = getAvatarBorderProps(border.key, accentHex);
            const previewAvatar = (
              <div
                className="h-11 w-11 rounded-full bg-purple/20"
                style={preview.avatarStyle}
              />
            );

            return (
              <button
                key={border.key}
                type="button"
                disabled={Boolean(locked)}
                onClick={() => setSelected(border.key)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all ${
                  active ? "border-purple/50 bg-purple/8" : "border-border bg-white/3 hover:border-border/80"
                } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {preview.wrapperClassName ? (
                  <div className={preview.wrapperClassName} style={preview.wrapperStyle}>
                    {previewAvatar}
                  </div>
                ) : (
                  previewAvatar
                )}
                <span className="text-[10px] text-text-secondary text-center leading-tight">{border.label}</span>
                {locked ? (
                  <Crown size={10} className="absolute top-1.5 right-1.5 text-amber-300" />
                ) : active ? (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-purple text-white flex items-center justify-center">
                    <Check size={8} />
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
          disabled={isPending || selected === currentBorder}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Terapkan Border
        </button>

        {state.success && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 ml-3">
            <CheckCircle2 size={13} />
            Border diterapkan
          </span>
        )}
      </form>
    </div>
  );
}
