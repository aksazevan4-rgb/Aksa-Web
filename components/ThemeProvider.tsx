"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type AccentPreset =
  | "purple"
  | "blue"
  | "cyan"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "pink";

export const ACCENT_PRESETS: { id: AccentPreset; label: string; hex: string }[] = [
  { id: "purple", label: "Purple", hex: "#9b6dff" },
  { id: "blue", label: "Blue", hex: "#4f9eff" },
  { id: "cyan", label: "Cyan", hex: "#22d3ee" },
  { id: "green", label: "Green", hex: "#34d399" },
  { id: "yellow", label: "Yellow", hex: "#eab308" },
  { id: "orange", label: "Orange", hex: "#f97316" },
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "pink", label: "Pink", hex: "#ec4899" },
];

const MODE_COOKIE = "aksa-theme-mode";
const ACCENT_COOKIE = "aksa-theme-accent";
const CUSTOM_HEX_COOKIE = "aksa-theme-hex";
const STORAGE_KEY = "aksa-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

interface ThemeState {
  mode: ThemeMode;
  accent: AccentPreset | "custom";
  customHex: string | null;
}

interface ThemeContextValue extends ThemeState {
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  setAccentPreset: (preset: AccentPreset) => void;
  setCustomHex: (hex: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

// Hex → { accent, accent-dim, accent-glow } sederhana via HSL lightness shift,
// supaya custom color tetap punya varian gelap/terang yang konsisten dengan
// preset bawaan tanpa perlu palette generator eksternal.
function shadesFromHex(hex: string) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const toHex = (hue: number, sat: number, light: number) => {
    const c = (1 - Math.abs(2 * light - 1)) * sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = light - c / 2;
    let rr = 0;
    let gg = 0;
    let bb = 0;
    if (hue < 60) [rr, gg, bb] = [c, x, 0];
    else if (hue < 120) [rr, gg, bb] = [x, c, 0];
    else if (hue < 180) [rr, gg, bb] = [0, c, x];
    else if (hue < 240) [rr, gg, bb] = [0, x, c];
    else if (hue < 300) [rr, gg, bb] = [x, 0, c];
    else [rr, gg, bb] = [c, 0, x];
    const toByte = (v: number) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toByte(rr)}${toByte(gg)}${toByte(bb)}`;
  };

  return {
    accent: hex,
    dim: toHex(h, s, Math.max(l - 0.14, 0.08)),
    glow: toHex(h, s, Math.min(l + 0.18, 0.92)),
  };
}

function loadInitialTheme(): ThemeState {
  if (typeof window === "undefined") {
    return { mode: "dark", accent: "purple", customHex: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as ThemeState;
      return {
        mode: saved.mode ?? "dark",
        accent: saved.accent ?? "purple",
        customHex: saved.customHex ?? null,
      };
    }
  } catch {
    // localStorage tidak tersedia / data korup — fallback ke cookie
  }
  const cookieMode = readCookie(MODE_COOKIE) as ThemeMode | null;
  const cookieAccent = readCookie(ACCENT_COOKIE) as AccentPreset | "custom" | null;
  const cookieHex = readCookie(CUSTOM_HEX_COOKIE);
  return {
    mode: cookieMode ?? "dark",
    accent: cookieAccent ?? "purple",
    customHex: cookieHex ?? null,
  };
}

function resolveSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(loadInitialTheme);
  const [mode, setModeState] = useState<ThemeMode>(initial.mode);
  const [accent, setAccentState] = useState<AccentPreset | "custom">(
    initial.accent
  );
  const [customHex, setCustomHexState] = useState<string | null>(
    initial.customHex
  );
  // State ini HANYA menyimpan sinyal preferensi OS (dark/light), bukan
  // hasil akhir tema. resolvedMode di bawah diturunkan (derived) dari
  // `mode` + `systemPreference` lewat useMemo, bukan disalin lewat
  // setState di dalam effect — effect di bawah murni untuk subscribe ke
  // perubahan preferensi OS, sesuai pola "subscribing to an external
  // store" yang direkomendasikan React.
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">(
    () => (initial.mode === "system" ? resolveSystemMode() : "dark")
  );

  const resolvedMode = useMemo<"light" | "dark">(
    () => (mode === "system" ? systemPreference : mode),
    [mode, systemPreference]
  );

  // Subscribe ke perubahan preferensi OS — hanya relevan kalau mode saat
  // ini "system", tapi listener tetap dipasang setiap mode berubah supaya
  // selalu sinkron begitu user beralih ke "system" lagi nanti.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemPreference(mq.matches ? "dark" : "light");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mode]);

  // Terapkan ke <html> setiap ada perubahan state, plus persist.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedMode);

    if (accent === "custom" && customHex) {
      const { accent: a, dim, glow } = shadesFromHex(customHex);
      root.style.setProperty("--accent", a);
      root.style.setProperty("--accent-dim", dim);
      root.style.setProperty("--accent-glow", glow);
      root.removeAttribute("data-accent");
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-dim");
      root.style.removeProperty("--accent-glow");
      root.setAttribute("data-accent", accent);
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, accent, customHex })
      );
    } catch {
      // localStorage penuh / diblokir — abaikan, cookie tetap jalan di bawah
    }
    writeCookie(MODE_COOKIE, mode);
    writeCookie(ACCENT_COOKIE, accent);
    if (customHex) writeCookie(CUSTOM_HEX_COOKIE, customHex);
  }, [mode, accent, customHex, resolvedMode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);

  const setAccentPreset = useCallback((preset: AccentPreset) => {
    setAccentState(preset);
  }, []);

  const setCustomHex = useCallback((hex: string) => {
    setCustomHexState(hex);
    setAccentState("custom");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      accent,
      customHex,
      resolvedMode,
      setMode,
      setAccentPreset,
      setCustomHex,
    }),
    [mode, accent, customHex, resolvedMode, setMode, setAccentPreset, setCustomHex]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme harus dipakai di dalam <ThemeProvider>");
  }
  return ctx;
}
