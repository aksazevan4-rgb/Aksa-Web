"use client";

import { useState } from "react";
import { LayoutGrid, ImageIcon, Blocks, ExternalLink, CircleDashed, Type, Sparkles } from "lucide-react";
import Link from "next/link";
import { LayoutPicker } from "./LayoutPicker";
import { BackgroundPicker } from "./BackgroundPicker";
import { BorderPicker } from "./BorderPicker";
import { FontPicker } from "./FontPicker";
import { WidgetManager } from "./WidgetManager";
import { MediaLibrary } from "./MediaLibrary";
import { ProfileEffectsSliders } from "./ProfileEffectsSliders";
import type { WidgetConfigMap } from "@/lib/widget-registry";
import { PROFILE_THEMES } from "@/lib/profile-themes";

type Tab = "layout" | "media" | "border" | "font" | "widgets" | "effects";

interface ProfileEffects {
  cardOpacity: number;
  cardBlur: number;
  glowUsername: boolean;
  glowSocials: boolean;
  glowBadges: boolean;
}

interface Props {
  username: string | null;
  currentLayout: string;
  currentTheme: string;
  currentBorder: string;
  currentFont: string;
  currentBackground: { type: string; colors?: string[]; mediaUrl?: string } | null;
  widgetConfig: WidgetConfigMap | null;
  accessibleFeatures: string[];
  currentAvatarUrl: string | null;
  currentBannerUrl: string | null;
  currentCursorUrl: string | null;
  currentAudioUrl: string | null;
  currentEffects: ProfileEffects | null;
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "layout", label: "Layout & Tema", icon: LayoutGrid },
  { key: "media", label: "Media Profil", icon: ImageIcon },
  { key: "border", label: "Border", icon: CircleDashed },
  { key: "font", label: "Font", icon: Type },
  { key: "widgets", label: "Widget", icon: Blocks },
  { key: "effects", label: "Efek Profil", icon: Sparkles },
];

export function AppearanceClient({
  username,
  currentLayout,
  currentTheme,
  currentBorder,
  currentFont,
  currentBackground,
  widgetConfig,
  accessibleFeatures,
  currentAvatarUrl,
  currentBannerUrl,
  currentCursorUrl,
  currentAudioUrl,
  currentEffects,
}: Props) {
  const [tab, setTab] = useState<Tab>("layout");
  const accentHex = PROFILE_THEMES.find((t) => t.key === currentTheme)?.accentHex ?? "#9b6dff";

  const themeLabel = PROFILE_THEMES.find((t) => t.key === currentTheme)?.label ?? "Default";
  const backgroundSwatch =
    currentBackground?.type === "gradient" && currentBackground.colors?.length
      ? `linear-gradient(135deg, ${currentBackground.colors.join(", ")})`
      : currentBackground?.type === "image" && currentBackground.mediaUrl
        ? `url(${currentBackground.mediaUrl}) center/cover`
        : `linear-gradient(135deg, ${accentHex}33, transparent)`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
      <div className="space-y-5 min-w-0">
        {username && (
          <Link
            href={`/${username}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-purple hover:underline"
          >
            Lihat hasil di profil publik
            <ExternalLink size={11} />
          </Link>
        )}

        {/* Tab bar */}
        <div className="glass rounded-2xl p-1.5 flex gap-1 flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                tab === key
                  ? "bg-purple/15 text-purple border border-purple/25"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "layout" && (
          <LayoutPicker
            currentLayout={currentLayout}
            currentTheme={currentTheme}
            accessibleFeatures={accessibleFeatures}
          />
        )}

        {tab === "media" && (
          <div className="space-y-5">
            <MediaLibrary
              currentAvatarUrl={currentAvatarUrl}
              currentBannerUrl={currentBannerUrl}
              currentBackgroundUrl={currentBackground?.mediaUrl ?? null}
              currentCursorUrl={currentCursorUrl}
              currentAudioUrl={currentAudioUrl}
            />
            <BackgroundPicker
              currentBackground={currentBackground}
              accessibleFeatures={accessibleFeatures}
            />
          </div>
        )}

        {tab === "border" && (
          <BorderPicker
            currentBorder={currentBorder}
            accentHex={accentHex}
            accessibleFeatures={accessibleFeatures}
          />
        )}

        {tab === "font" && (
          <FontPicker currentFont={currentFont} accessibleFeatures={accessibleFeatures} />
        )}

        {tab === "widgets" && (
          <WidgetManager
            widgetConfig={widgetConfig}
            accessibleFeatures={accessibleFeatures}
          />
        )}

        {tab === "effects" && (
          <ProfileEffectsSliders
            initialOpacity={currentEffects?.cardOpacity ?? 100}
            initialBlur={currentEffects?.cardBlur ?? 0}
            initialGlowUsername={currentEffects?.glowUsername ?? false}
            initialGlowSocials={currentEffects?.glowSocials ?? false}
            initialGlowBadges={currentEffects?.glowBadges ?? false}
          />
        )}
      </div>

      {/* Sticky summary preview — quick glance at the current visual identity */}
      <div className="xl:sticky xl:top-24 space-y-4">
        <div className="glass rounded-2xl p-5 space-y-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-text-tertiary">
            Ringkasan Tampilan
          </p>

          <div
            className="rounded-2xl border overflow-hidden h-40 flex items-end p-4"
            style={{
              background: backgroundSwatch,
              borderColor: `${accentHex}55`,
              borderWidth: currentBorder !== "none" ? 2 : 1,
            }}
          >
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: `${accentHex}33`, color: accentHex }}
            >
              {themeLabel}
            </span>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Layout</dt>
              <dd className="text-text-primary font-medium capitalize">{currentLayout}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Tema</dt>
              <dd className="text-text-primary font-medium">{themeLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Border</dt>
              <dd className="text-text-primary font-medium capitalize">{currentBorder}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-tertiary">Font</dt>
              <dd className="text-text-primary font-medium capitalize">{currentFont}</dd>
            </div>
          </dl>

          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="flex items-center justify-center gap-2 rounded-xl bg-purple/10 border border-purple/25 px-4 py-2.5 text-xs font-medium text-purple hover:bg-purple/20 transition-colors"
            >
              Buka Profil Publik
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
