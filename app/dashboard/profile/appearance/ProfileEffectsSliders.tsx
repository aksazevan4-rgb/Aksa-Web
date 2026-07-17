"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { updateProfileEffects } from "./actions";

interface Props {
  initialOpacity: number;
  initialBlur: number;
  initialGlowUsername: boolean;
  initialGlowSocials: boolean;
  initialGlowBadges: boolean;
}

export function ProfileEffectsSliders({
  initialOpacity,
  initialBlur,
  initialGlowUsername,
  initialGlowSocials,
  initialGlowBadges,
}: Props) {
  const [opacity, setOpacity] = useState(initialOpacity);
  const [blur, setBlur] = useState(initialBlur);
  const [glowUsername, setGlowUsername] = useState(initialGlowUsername);
  const [glowSocials, setGlowSocials] = useState(initialGlowSocials);
  const [glowBadges, setGlowBadges] = useState(initialGlowBadges);
  const [isPending, startTransition] = useTransition();

  function save(overrides: Partial<{
    opacity: number;
    blur: number;
    glowUsername: boolean;
    glowSocials: boolean;
    glowBadges: boolean;
  }> = {}) {
    const next = {
      cardOpacity: overrides.opacity ?? opacity,
      cardBlur: overrides.blur ?? blur,
      glowUsername: overrides.glowUsername ?? glowUsername,
      glowSocials: overrides.glowSocials ?? glowSocials,
      glowBadges: overrides.glowBadges ?? glowBadges,
    };
    startTransition(() => {
      void updateProfileEffects(next);
    });
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Profile Opacity & Blur</h3>
        {isPending && <Loader2 size={12} className="animate-spin text-text-tertiary ml-auto" />}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-text-tertiary">Profile Opacity</label>
          <span className="text-xs text-text-secondary tabular-nums">{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          onMouseUp={() => save()}
          onTouchEnd={() => save()}
          className="w-full accent-purple"
        />
        <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-text-tertiary">Profile Blur</label>
          <span className="text-xs text-text-secondary tabular-nums">{blur}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={80}
          value={blur}
          onChange={(e) => setBlur(Number(e.target.value))}
          onMouseUp={() => save()}
          onTouchEnd={() => save()}
          className="w-full accent-purple"
        />
        <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
          <span>0px</span>
          <span>40px</span>
          <span>80px</span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <p className="text-xs text-text-tertiary mb-1">Glow Settings</p>
        <GlowToggle
          label="Username"
          checked={glowUsername}
          onChange={(v) => {
            setGlowUsername(v);
            save({ glowUsername: v });
          }}
        />
        <GlowToggle
          label="Socials"
          checked={glowSocials}
          onChange={(v) => {
            setGlowSocials(v);
            save({ glowSocials: v });
          }}
        />
        <GlowToggle
          label="Badges"
          checked={glowBadges}
          onChange={(v) => {
            setGlowBadges(v);
            save({ glowBadges: v });
          }}
        />
      </div>
    </div>
  );
}

function GlowToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
        checked
          ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-300"
          : "border-border text-text-secondary hover:bg-white/5"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Sparkles size={12} />
        {label}
      </span>
      <span>{checked ? "Aktif" : "Nonaktif"}</span>
    </button>
  );
}
