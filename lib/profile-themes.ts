/**
 * lib/profile-themes.ts
 *
 * Layout + background + theme system for public profile pages (/[username]).
 * Separate from sitewide ThemeProvider (visitor's light/dark preference) —
 * this is the PROFILE OWNER's chosen visual identity, shown to all visitors.
 *
 * Stored as keys in User.profileTheme / profileLayout / profileBackground.
 * New layouts/themes/backgrounds can be added here without touching the
 * rendering components — components read from this registry.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOR THEMES (banner gradient + accent)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileThemePreset {
  key: string;
  label: string;
  bannerClass: string;
  buttonClass: string;
  accentTextClass: string;
  accentHex: string;
  /** Premium feature key required to use this theme, or null if free. */
  premiumFeatureKey: string | null;
}

export const PROFILE_THEMES: ProfileThemePreset[] = [
  {
    key: "default",
    label: "AKSA Default (Ungu-Biru)",
    bannerClass: "from-purple/40 via-blue/30 to-black",
    buttonClass: "bg-white/5 border-border hover:border-purple/50 hover:bg-purple/10",
    accentTextClass: "text-purple",
    accentHex: "#9b6dff",
    premiumFeatureKey: null,
  },
  {
    key: "midnight",
    label: "Midnight",
    bannerClass: "from-slate-900 via-blue-950 to-black",
    buttonClass: "bg-white/5 border-border hover:border-blue-400/50 hover:bg-blue-500/10",
    accentTextClass: "text-blue-300",
    accentHex: "#4f9eff",
    premiumFeatureKey: null,
  },
  {
    key: "sunset",
    label: "Sunset",
    bannerClass: "from-orange-500/40 via-pink-500/30 to-black",
    buttonClass: "bg-white/5 border-border hover:border-orange-400/50 hover:bg-orange-500/10",
    accentTextClass: "text-orange-300",
    accentHex: "#f97316",
    premiumFeatureKey: null,
  },
  {
    key: "forest",
    label: "Forest",
    bannerClass: "from-emerald-600/40 via-teal-600/25 to-black",
    buttonClass: "bg-white/5 border-border hover:border-emerald-400/50 hover:bg-emerald-500/10",
    accentTextClass: "text-emerald-300",
    accentHex: "#34d399",
    premiumFeatureKey: null,
  },
  {
    key: "neon",
    label: "Neon",
    bannerClass: "from-fuchsia-600/40 via-purple-600/30 to-black",
    buttonClass: "bg-white/5 border-border hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10",
    accentTextClass: "text-fuchsia-300",
    accentHex: "#e879f9",
    premiumFeatureKey: "layout_neon",
  },
  {
    key: "cyber",
    label: "Cyber",
    bannerClass: "from-cyan-500/40 via-blue-600/30 to-black",
    buttonClass: "bg-white/5 border-border hover:border-cyan-400/60 hover:bg-cyan-500/10",
    accentTextClass: "text-cyan-300",
    accentHex: "#22d3ee",
    premiumFeatureKey: "layout_cyber",
  },
  {
    key: "rosegold",
    label: "Rose Gold",
    bannerClass: "from-rose-400/40 via-amber-300/25 to-black",
    buttonClass: "bg-white/5 border-border hover:border-rose-300/60 hover:bg-rose-400/10",
    accentTextClass: "text-rose-300",
    accentHex: "#fb7185",
    premiumFeatureKey: "layout_neon",
  },
];

/**
 * customAccentHex overrides just the accent color on top of whichever
 * preset is chosen — banner gradient / button hover colors stay the
 * preset's own (those are Tailwind classes tied to fixed design tokens,
 * not arbitrary hex, so they can't be swapped at runtime the same way).
 * This deliberately does NOT cover the full 8-property color picker from
 * the original brief (Primary/Secondary/Background/Text/Border/Glow/
 * Shadow) -- Background and Border already have their own dedicated,
 * more capable systems elsewhere in this file, and duplicating color
 * control for those here would just create two controls fighting over
 * the same pixels. Accent is the one color used everywhere *without*
 * an existing dedicated picker (border glow, link icons, hover states),
 * so it's the correctly-scoped slice of that brief item to expose here.
 */
export function getProfileTheme(key?: string | null, customAccentHex?: string | null): ProfileThemePreset {
  const preset = PROFILE_THEMES.find((t) => t.key === key) ?? PROFILE_THEMES[0];
  if (!customAccentHex) return preset;
  return { ...preset, accentHex: customAccentHex };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUTS (structural arrangement of profile page)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileLayoutPreset {
  key: string;
  label: string;
  description: string;
  premiumFeatureKey: string | null;
}

export const PROFILE_LAYOUTS: ProfileLayoutPreset[] = [
  {
    key: "classic",
    label: "Classic",
    description: "Avatar di tengah, bio, lalu daftar link vertikal.",
    premiumFeatureKey: null,
  },
  {
    key: "modern",
    label: "Modern",
    description: "Banner besar, avatar overlap, link 2 kolom.",
    premiumFeatureKey: null,
  },
  {
    key: "glass",
    label: "Glass",
    description: "Full glassmorphism dengan background blur tebal.",
    premiumFeatureKey: "layout_glass",
  },
  {
    key: "minimal",
    label: "Minimal",
    description: "Super clean, fokus pada tipografi.",
    premiumFeatureKey: null,
  },
  {
    key: "compact",
    label: "Compact",
    description: "Padat dan ringkas — cocok untuk banyak link.",
    premiumFeatureKey: "layout_compact",
  },
  {
    key: "fullwidth",
    label: "Full Width",
    description: "Dua kolom lebar di desktop, identitas fixed di kiri.",
    premiumFeatureKey: "layout_fullwidth",
  },
  {
    key: "creator",
    label: "Creator",
    description: "Header asimetris, link jadi pill row horizontal.",
    premiumFeatureKey: "layout_creator",
  },
  {
    key: "showcase",
    label: "Showcase",
    description: "Background full-layar, satu kartu identitas mengambang — gaya halaman bio-link.",
    premiumFeatureKey: null,
  },
];

export function getProfileLayout(key?: string | null): ProfileLayoutPreset {
  return PROFILE_LAYOUTS.find((l) => l.key === key) ?? PROFILE_LAYOUTS[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUNDS
// ─────────────────────────────────────────────────────────────────────────────

export type BackgroundType =
  | "solid"
  | "gradient"
  | "animated-gradient"
  | "image"
  | "video"
  | "aurora"
  | "mesh-gradient"
  | "galaxy"
  | "particles"
  | "neon";

export interface ProfileBackgroundConfig {
  type: BackgroundType;
  /** Solid: hex color. Gradient/aurora/mesh-gradient/neon: comma-separated hex stops. */
  colors?: string[];
  /** Image/video: media URL. */
  mediaUrl?: string;
}

export const BACKGROUND_TYPE_LABELS: Record<BackgroundType, string> = {
  solid: "Warna Solid",
  gradient: "Gradient",
  "animated-gradient": "Animated Gradient",
  image: "Gambar",
  video: "Video",
  aurora: "Aurora",
  "mesh-gradient": "Mesh Gradient",
  galaxy: "Galaxy",
  particles: "Animated Particles",
  neon: "Neon",
};

export const BACKGROUND_PREMIUM_REQUIREMENT: Record<BackgroundType, string | null> = {
  solid: null,
  gradient: null,
  "animated-gradient": "custom_background_animated",
  image: null,
  video: "custom_background_video",
  aurora: "custom_background_aurora",
  "mesh-gradient": "custom_background_mesh",
  galaxy: "custom_background_galaxy",
  particles: "custom_background_particles",
  neon: "custom_background_neon",
};

export const DEFAULT_BACKGROUND: ProfileBackgroundConfig = {
  type: "gradient",
  colors: ["#07070f", "#141424"],
};

/** Generate inline CSS for a background config. Used server-side for SSR. */
export function getBackgroundStyle(config: ProfileBackgroundConfig | null): React.CSSProperties {
  const cfg = config ?? DEFAULT_BACKGROUND;

  switch (cfg.type) {
    case "solid":
      return { background: cfg.colors?.[0] ?? "#07070f" };
    case "gradient":
    case "animated-gradient": {
      const colors = cfg.colors?.length ? cfg.colors : DEFAULT_BACKGROUND.colors!;
      return {
        background: `linear-gradient(135deg, ${colors.join(", ")})`,
        backgroundSize: cfg.type === "animated-gradient" ? "200% 200%" : undefined,
      };
    }
    case "image":
      return cfg.mediaUrl
        ? {
            backgroundImage: `url(${cfg.mediaUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { background: "#07070f" };
    case "video":
      // Video handled separately via <video> element, this is fallback bg.
      return { background: "#07070f" };
    case "aurora":
    case "galaxy":
    case "neon":
      // Dark base — the actual aurora/star/glow layers render on top via
      // <ProfileBackgroundFX>, since they need real DOM elements (blurred
      // blobs, star dots) that a single CSS `background` can't express.
      return { background: "#07070a" };
    case "mesh-gradient": {
      const colors = cfg.colors?.length ? cfg.colors : ["#9b6dff", "#4d7cff", "#ff6d9b"];
      return {
        background: `#07070f
          radial-gradient(at 20% 20%, ${colors[0] ?? "#9b6dff"}55 0px, transparent 55%),
          radial-gradient(at 80% 15%, ${colors[1] ?? "#4d7cff"}4d 0px, transparent 55%),
          radial-gradient(at 30% 85%, ${colors[2] ?? "#ff6d9b"}40 0px, transparent 55%),
          radial-gradient(at 85% 80%, ${colors[0] ?? "#9b6dff"}33 0px, transparent 55%)
        `.replace(/\s+/g, " "),
      };
    }
    case "particles":
      return { background: "linear-gradient(180deg, #07070a, #0c0c16)" };
    default:
      return { background: "#07070f" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BORDERS (currently: avatar ring. See getAvatarBorderProps.)
// ─────────────────────────────────────────────────────────────────────────────

export type BorderStyleKey =
  | "none"
  | "soft"
  | "glow"
  | "neon"
  | "animated"
  | "rainbow"
  | "cyber"
  | "glass"
  | "dashed"
  | "dotted"
  | "double"
  | "gradient"
  | "premium";

export interface BorderStylePreset {
  key: BorderStyleKey;
  label: string;
  premiumFeatureKey: string | null;
}

export const BORDER_STYLES: BorderStylePreset[] = [
  { key: "none", label: "None", premiumFeatureKey: null },
  { key: "soft", label: "Soft", premiumFeatureKey: null },
  { key: "dashed", label: "Dashed", premiumFeatureKey: "border_dashed" },
  { key: "dotted", label: "Dotted", premiumFeatureKey: "border_dotted" },
  { key: "double", label: "Double", premiumFeatureKey: "border_double" },
  { key: "glass", label: "Glass", premiumFeatureKey: "border_glass" },
  { key: "glow", label: "Glow", premiumFeatureKey: "border_glow" },
  { key: "neon", label: "Neon", premiumFeatureKey: "border_neon" },
  { key: "cyber", label: "Cyber", premiumFeatureKey: "border_cyber" },
  { key: "gradient", label: "Gradient", premiumFeatureKey: "border_gradient" },
  { key: "rainbow", label: "Rainbow", premiumFeatureKey: "border_rainbow" },
  { key: "animated", label: "Animated", premiumFeatureKey: "border_animated" },
  { key: "premium", label: "Premium", premiumFeatureKey: "border_premium" },
];

export function getBorderStyle(key?: string | null): BorderStylePreset {
  return BORDER_STYLES.find((b) => b.key === key) ?? BORDER_STYLES[0];
}

export interface AvatarBorderProps {
  /** Wraps the avatar. Needed for ring styles that use a padded gradient background. */
  wrapperClassName: string;
  wrapperStyle?: React.CSSProperties;
  /** Applied on top of the avatar's own classes/style. */
  avatarClassName: string;
  avatarStyle?: React.CSSProperties;
}

/**
 * Resolve a border style into concrete class/style props for wrapping a
 * circular <UserAvatar>. Every layout already gives the avatar its own base
 * border (e.g. a 4px "border-bg" ring so it reads cleanly against an
 * overlapping banner) — this function's output gets layered on top of that
 * via the `className` the caller passes in, so anything here that should
 * actually take effect MUST be an inline style, not a Tailwind class:
 * two conflicting Tailwind utilities (the layout's `border-4` vs this
 * function's `border-2`) have no guaranteed winner based on class-attribute
 * order, but an inline style always beats a class. "none" is a real no-op
 * (no style at all) so a layout's own default border still shows through.
 *
 * Multi-color ring styles (gradient/rainbow/animated) can't be a CSS
 * border at all (border-image ignores border-radius in every browser), so
 * those use a wrapper <div> with the gradient as background + padding —
 * the classic "story ring" technique — instead of styling the avatar itself.
 */
export function getAvatarBorderProps(key: string | null | undefined, accentHex: string): AvatarBorderProps {
  const style = getBorderStyle(key);
  const NONE: AvatarBorderProps = { wrapperClassName: "", avatarClassName: "" };
  const solid = (borderStyle: React.CSSProperties): AvatarBorderProps => ({
    wrapperClassName: "",
    avatarClassName: "",
    avatarStyle: { borderStyle: "solid", ...borderStyle },
  });

  switch (style.key) {
    case "none":
      return NONE;
    case "soft":
      return solid({ borderWidth: 2, borderColor: "rgba(255,255,255,0.18)" });
    case "dashed":
      return solid({ borderStyle: "dashed", borderWidth: 2, borderColor: accentHex });
    case "dotted":
      return solid({ borderStyle: "dotted", borderWidth: 2, borderColor: accentHex });
    case "double":
      return solid({ borderStyle: "double", borderWidth: 6, borderColor: accentHex });
    case "glass":
      return solid({ borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" });
    case "glow":
      return solid({ borderWidth: 2, borderColor: accentHex, boxShadow: `0 0 16px 2px ${accentHex}55` });
    case "neon":
      return solid({
        borderWidth: 2,
        borderColor: accentHex,
        boxShadow: `0 0 22px 4px ${accentHex}80, 0 0 4px 1px ${accentHex}`,
      });
    case "cyber":
      return solid({
        borderWidth: 2,
        borderColor: accentHex,
        boxShadow: `0 0 0 3px rgba(0,0,0,0.9), 0 0 0 4px ${accentHex}60, 0 0 14px 2px ${accentHex}40`,
      });
    case "premium":
      return solid({ borderWidth: 2, borderColor: "#fbbf24", boxShadow: "0 0 18px 3px rgba(251,191,36,0.45)" });
    case "gradient":
      return {
        wrapperClassName: "inline-flex rounded-full p-[3px]",
        wrapperStyle: { background: `linear-gradient(135deg, ${accentHex}, #ffffff30)` },
        avatarClassName: "",
      };
    case "rainbow":
      return {
        wrapperClassName: "inline-flex rounded-full p-[3px]",
        wrapperStyle: {
          background: "conic-gradient(from 0deg, #ff5f6d, #ffc371, #7bed9f, #70a1ff, #a55eea, #ff5f6d)",
        },
        avatarClassName: "",
      };
    case "animated":
      return {
        wrapperClassName: "inline-flex rounded-full p-[3px] animate-spin",
        wrapperStyle: {
          background: `conic-gradient(from 0deg, ${accentHex}, transparent, ${accentHex})`,
          animationDuration: "3s",
        },
        avatarClassName: "",
      };
    default:
      return NONE;
  }
}

/**
 * Resolve a border style into CSS custom properties for the "Card/Widget"
 * border target — consumed by the .glass / .glass-bright classes in
 * app/globals.css (--card-border-width/-style/-color/-glow), which is what
 * every widget card and several layout containers already use. Setting
 * these vars once on a layout's root element cascades to every .glass
 * descendant, so no individual widget file needs to know about borders.
 *
 * Honest simplification: gradient/rainbow/animated can't be a literal
 * multi-color line around a rounded, backdrop-blurred rectangle without a
 * background+mask double-layer technique that would fight the glass blur
 * (border-image, the "normal" way to do a gradient border, ignores
 * border-radius in every browser — same limitation as the avatar ring).
 * Those three render as a vivid, glowing accent border instead of a literal
 * gradient line. Genuinely worth revisiting with a dedicated pseudo-element
 * approach if the four solid/soft/neon-family styles below feel good and
 * this is worth the extra complexity.
 */
export function getCardBorderVars(key: string | null | undefined, accentHex: string): React.CSSProperties {
  const style = getBorderStyle(key);
  const vars = (v: Record<string, string>) => v as React.CSSProperties;

  switch (style.key) {
    case "none":
      return vars({ "--card-border-width": "0px" });
    case "soft":
      return vars({}); // .glass's own default (subtle purple-tinted line) is already "soft"
    case "dashed":
      return vars({ "--card-border-width": "1px", "--card-border-style": "dashed", "--card-border-color": accentHex });
    case "dotted":
      return vars({ "--card-border-width": "1px", "--card-border-style": "dotted", "--card-border-color": accentHex });
    case "double":
      return vars({ "--card-border-width": "4px", "--card-border-style": "double", "--card-border-color": accentHex });
    case "glass":
      return vars({ "--card-border-width": "1px", "--card-border-color": "rgba(255,255,255,0.28)" });
    case "glow":
      return vars({
        "--card-border-color": accentHex,
        "--card-border-glow": `0 0 20px -8px ${accentHex}90`,
      });
    case "neon":
    case "gradient":
      return vars({
        "--card-border-color": accentHex,
        "--card-border-glow": `0 0 26px -6px ${accentHex}, 0 0 3px 0px ${accentHex}80`,
      });
    case "cyber":
      return vars({
        "--card-border-color": accentHex,
        "--card-border-glow": `0 0 0 1px ${accentHex}50, 0 0 20px -6px ${accentHex}`,
      });
    case "rainbow":
    case "animated":
      return vars({
        "--card-border-color": "#c084fc",
        "--card-border-glow": "0 0 24px -6px rgba(192,132,252,0.85)",
      });
    case "premium":
      return vars({
        "--card-border-color": "#fbbf24",
        "--card-border-glow": "0 0 20px -6px rgba(251,191,36,0.7)",
      });
    default:
      return vars({});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FONT SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileFontPreset {
  key: string;
  label: string;
  /** CSS font-family value, self-hosted via @fontsource (see app/layout.tsx) -- no external Google Fonts request. */
  fontFamily: string;
  premiumFeatureKey: string | null;
}

export const PROFILE_FONTS: ProfileFontPreset[] = [
  { key: "inter", label: "Inter", fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", premiumFeatureKey: null },
  { key: "poppins", label: "Poppins", fontFamily: "'Poppins', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "manrope", label: "Manrope", fontFamily: "'Manrope', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "outfit", label: "Outfit", fontFamily: "'Outfit', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "plus-jakarta-sans", label: "Plus Jakarta Sans", fontFamily: "'Plus Jakarta Sans', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "sora", label: "Sora", fontFamily: "'Sora', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "dm-sans", label: "DM Sans", fontFamily: "'DM Sans', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "space-grotesk", label: "Space Grotesk", fontFamily: "'Space Grotesk', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
  { key: "syne", label: "Syne", fontFamily: "'Syne', ui-sans-serif, sans-serif", premiumFeatureKey: "custom_font" },
];

export function getProfileFont(key?: string | null): ProfileFontPreset {
  return PROFILE_FONTS.find((f) => f.key === key) ?? PROFILE_FONTS[0];
}
