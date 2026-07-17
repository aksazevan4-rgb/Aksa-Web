"use client";

import { useActionState, useState } from "react";
import { Crown, Loader2, CheckCircle2 } from "lucide-react";
import { updateProfileBackground } from "./actions";
import {
  BACKGROUND_TYPE_LABELS,
  BACKGROUND_PREMIUM_REQUIREMENT,
  getBackgroundStyle,
  type BackgroundType,
} from "@/lib/profile-themes";
import { ProfileBackgroundFX } from "@/components/profile/ProfileBackgroundFX";
import { UserMediaUploadField } from "@/components/UserMediaUploadField";

interface Props {
  currentBackground: { type: string; colors?: string[]; mediaUrl?: string } | null;
  accessibleFeatures: string[];
}

const TYPES: BackgroundType[] = [
  "solid",
  "gradient",
  "animated-gradient",
  "mesh-gradient",
  "aurora",
  "galaxy",
  "neon",
  "particles",
  "image",
  "video",
];

const COLOR_PICKER_TYPES: BackgroundType[] = ["gradient", "animated-gradient", "mesh-gradient", "aurora", "neon"];

const PRESET_GRADIENTS = [
  ["#9b6dff", "#4f9eff"],
  ["#f97316", "#ec4899"],
  ["#34d399", "#0d9488"],
  ["#e879f9", "#9333ea"],
  ["#07070f", "#141424"],
  ["#fb7185", "#fbbf24"],
];

const PRESET_SOLIDS = ["#07070f", "#0f172a", "#1e1b2e", "#18181b", "#0a0a0a", "#111827"];

export function BackgroundPicker({ currentBackground, accessibleFeatures }: Props) {
  const [state, formAction, isPending] = useActionState(updateProfileBackground, {});
  const [type, setType] = useState<BackgroundType>(
    (currentBackground?.type as BackgroundType) ?? "gradient"
  );
  const [colors, setColors] = useState<string[]>(
    currentBackground?.colors ?? ["#9b6dff", "#4f9eff"]
  );
  const [mediaUrl, setMediaUrl] = useState(currentBackground?.mediaUrl ?? "");

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <h3 className="text-sm font-semibold text-text-primary">Background</h3>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="bgType" value={type} />
        <input type="hidden" name="bgColors" value={colors.join(",")} />
        <input type="hidden" name="bgMediaUrl" value={mediaUrl} />

        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const requiredFeature = BACKGROUND_PREMIUM_REQUIREMENT[t];
            const locked = requiredFeature && !accessibleFeatures.includes(requiredFeature);
            const active = type === t;

            return (
              <button
                key={t}
                type="button"
                disabled={Boolean(locked)}
                onClick={() => setType(t)}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs transition-all ${
                  active
                    ? "border-purple/50 bg-purple/10 text-text-primary"
                    : "border-border bg-white/3 text-text-secondary hover:border-border/80"
                } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {BACKGROUND_TYPE_LABELS[t]}
                {locked && <Crown size={11} className="text-amber-300" />}
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div
          className="relative h-28 rounded-2xl border border-border overflow-hidden"
          style={
            type === "solid"
              ? { background: colors[0] }
              : type === "gradient" || type === "animated-gradient"
              ? { background: `linear-gradient(135deg, ${colors.join(", ")})` }
              : type === "image" || type === "video"
              ? mediaUrl
                ? { backgroundImage: `url(${mediaUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "#07070f" }
              : getBackgroundStyle({ type, colors })
          }
        >
          {["aurora", "galaxy", "neon", "particles"].includes(type) && (
            <div className="absolute inset-0">
              <ProfileBackgroundFX type={type} colors={colors} accentHex={colors[0] ?? "#9b6dff"} />
            </div>
          )}
        </div>

        {/* Solid color picker */}
        {type === "solid" && (
          <div className="flex flex-wrap gap-2">
            {PRESET_SOLIDS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColors([c])}
                aria-label={`Warna ${c}`}
                aria-pressed={colors[0] === c}
                className={`h-9 w-9 rounded-lg border-2 transition-all ${
                  colors[0] === c ? "border-purple scale-105" : "border-border"
                }`}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={colors[0] ?? "#07070f"}
              onChange={(e) => setColors([e.target.value])}
              aria-label="Warna custom"
              className="h-9 w-9 rounded-lg border border-border bg-transparent cursor-pointer"
            />
          </div>
        )}

        {/* Gradient-family color picker — gradient/animated-gradient/mesh-gradient/aurora/neon all take 2 accent colors */}
        {COLOR_PICKER_TYPES.includes(type) && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setColors(g)}
                  aria-label={`Gradient ${g.join(" ke ")}`}
                  aria-pressed={colors.join() === g.join()}
                  className={`h-9 w-16 rounded-lg border-2 transition-all ${
                    colors.join() === g.join() ? "border-purple scale-105" : "border-border"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${g.join(", ")})` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-text-tertiary">Custom:</label>
              <input
                type="color"
                value={colors[0] ?? "#9b6dff"}
                onChange={(e) => setColors([e.target.value, colors[1] ?? "#4f9eff"])}
                aria-label="Warna gradient pertama"
                className="h-7 w-7 rounded border border-border bg-transparent cursor-pointer"
              />
              <input
                type="color"
                value={colors[1] ?? "#4f9eff"}
                onChange={(e) => setColors([colors[0] ?? "#9b6dff", e.target.value])}
                aria-label="Warna gradient kedua"
                className="h-7 w-7 rounded border border-border bg-transparent cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Image/video upload */}
        {(type === "image" || type === "video") && (
          <UserMediaUploadField
            name="bgMedia"
            label={type === "image" ? "Upload Gambar" : "Upload Video"}
            folder="profile-backgrounds"
            defaultValue={mediaUrl || null}
            aspectClassName="aspect-video"
            onUploaded={(url) => setMediaUrl(url)}
          />
        )}

        {state.error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-dim transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          Simpan Background
        </button>

        {state.success && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 ml-3">
            <CheckCircle2 size={13} />
            Background diperbarui
          </span>
        )}
      </form>
    </div>
  );
}
