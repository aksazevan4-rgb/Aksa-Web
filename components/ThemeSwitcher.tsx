"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";
import { ACCENT_PRESETS, useTheme } from "@/components/ThemeProvider";

const MODES: { id: "light" | "dark" | "system"; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

function isValidHex(value: string) {
  return /^#?[0-9a-fA-F]{6}$/.test(value);
}

/**
 * Panel pengaturan tema lengkap: mode (light/dark/system) + accent preset
 * + custom HEX. Cocok dipakai di halaman Settings dashboard.
 */
export function ThemeSettingsPanel() {
  const { mode, accent, customHex, setMode, setAccentPreset, setCustomHex } =
    useTheme();
  const [hexInput, setHexInput] = useState(customHex ?? "#9b6dff");
  const [hexError, setHexError] = useState(false);

  function applyHex() {
    if (!isValidHex(hexInput)) {
      setHexError(true);
      return;
    }
    setHexError(false);
    setCustomHex(hexInput.startsWith("#") ? hexInput : `#${hexInput}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-text-primary mb-3">Mode Tampilan</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-all ${
                mode === id
                  ? "border-purple/50 bg-purple/10 text-text-primary"
                  : "border-border text-text-secondary hover:border-purple/30 hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-3">Warna Aksen</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setAccentPreset(preset.id)}
              aria-label={preset.label}
              title={preset.label}
              className="relative h-10 w-10 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: preset.hex }}
            >
              {accent === preset.id && (
                <Check
                  size={16}
                  className="absolute inset-0 m-auto text-white drop-shadow"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text-primary mb-3">Custom HEX</p>
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-10 rounded-lg border border-border shrink-0"
            style={{
              backgroundColor: isValidHex(hexInput)
                ? hexInput.startsWith("#")
                  ? hexInput
                  : `#${hexInput}`
                : "transparent",
            }}
          />
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              setHexError(false);
            }}
            placeholder="#ff6600"
            maxLength={7}
            className={`flex-1 rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors ${
              hexError
                ? "border-red-400/60"
                : "border-border focus:border-purple/50"
            }`}
          />
          <button
            onClick={applyHex}
            className="rounded-lg bg-purple/15 px-4 py-2 text-sm font-medium text-purple transition-colors hover:bg-purple/25"
          >
            Terapkan
          </button>
        </div>
        {hexError && (
          <p className="mt-1.5 text-xs text-red-400">
            Format HEX tidak valid. Contoh: #ff6600
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Widget ringkas untuk navbar publik — dropdown kecil berisi mode toggle
 * + grid warna aksen, supaya visitor (login atau tidak) bisa langsung
 * ganti tema dari halaman manapun tanpa masuk dashboard.
 */
export function ThemeQuickSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { mode, accent, setMode, setAccentPreset } = useTheme();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Pengaturan tema"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full glass text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-purple/40 hover:text-purple"
      >
        <Palette size={17} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border bg-surface p-3 shadow-xl z-50">
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[11px] transition-all ${
                  mode === id
                    ? "border-purple/50 bg-purple/10 text-text-primary"
                    : "border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setAccentPreset(preset.id)}
                aria-label={preset.label}
                title={preset.label}
                className="relative h-6 w-6 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: preset.hex }}
              >
                {accent === preset.id && (
                  <Check
                    size={10}
                    className="absolute inset-0 m-auto text-white drop-shadow"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
