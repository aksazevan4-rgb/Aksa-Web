/**
 * lib/onboarding-presets.ts
 *
 * Fase 2 — User Onboarding. Maps each profile "type" a new user picks
 * during onboarding to a starter template: layout, color theme, and an
 * initial widget arrangement.
 *
 * Safety notes:
 * - `layoutKey` / `themeKey` here are restricted to entries in
 *   lib/profile-themes.ts with `premiumFeatureKey: null`. Onboarding must
 *   never silently hand a free account a premium layout/theme.
 * - `widgets` may reference premium widget keys (see lib/widget-registry.ts)
 *   because `resolveActiveWidgets()` already filters those out for users
 *   without the matching premium feature — storing `enabled: true` there
 *   just means the widget appears automatically the moment the user
 *   upgrades, without needing to revisit widget settings. Nothing here
 *   bypasses that gate.
 */

export interface OnboardingWidgetOverride {
  key: string;
  order: number;
}

export interface OnboardingPreset {
  id: string;
  label: string;
  description: string;
  /** lucide-react icon name, resolved in OnboardingClient */
  icon: string;
  layoutKey: "classic" | "modern" | "minimal";
  themeKey: "default" | "midnight" | "sunset" | "forest";
  widgets: OnboardingWidgetOverride[];
}

export const ONBOARDING_PRESETS: OnboardingPreset[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Bio link sederhana untuk identitas pribadimu.",
    icon: "User",
    layoutKey: "classic",
    themeKey: "default",
    widgets: [
      { key: "about", order: 0 },
      { key: "status", order: 1 },
      { key: "social", order: 2 },
      { key: "links", order: 3 },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    description: "Tampilkan repo, tech stack, dan proyekmu.",
    icon: "Code2",
    layoutKey: "modern",
    themeKey: "midnight",
    widgets: [
      { key: "about", order: 0 },
      { key: "skills", order: 1 },
      { key: "projects", order: 2 },
      { key: "embed", order: 3 },
      { key: "social", order: 4 },
      { key: "links", order: 5 },
    ],
  },
  {
    id: "gamer",
    label: "Gamer",
    description: "Status Discord, achievement, dan link tim/clan.",
    icon: "Gamepad2",
    layoutKey: "modern",
    themeKey: "midnight",
    widgets: [
      { key: "discord", order: 0 },
      { key: "discord-activity", order: 1 },
      { key: "achievement", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    id: "content-creator",
    label: "Content Creator",
    description: "Galeri karya, testimoni, dan semua platform kontenmu.",
    icon: "Clapperboard",
    layoutKey: "modern",
    themeKey: "sunset",
    widgets: [
      { key: "about", order: 0 },
      { key: "gallery", order: 1 },
      { key: "embed", order: 2 },
      { key: "testimonials", order: 3 },
      { key: "social", order: 4 },
      { key: "links", order: 5 },
    ],
  },
  {
    id: "streamer",
    label: "Streamer",
    description: "Now playing, jadwal live, dan link donasi.",
    icon: "Radio",
    layoutKey: "modern",
    themeKey: "midnight",
    widgets: [
      { key: "discord", order: 0 },
      { key: "spotify", order: 1 },
      { key: "donate", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    id: "designer",
    label: "Designer",
    description: "Portofolio visual yang bersih dan minim distraksi.",
    icon: "PenTool",
    layoutKey: "minimal",
    themeKey: "default",
    widgets: [
      { key: "about", order: 0 },
      { key: "gallery", order: 1 },
      { key: "projects", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    id: "business",
    label: "Business",
    description: "Kontak, testimoni klien, dan link layanan.",
    icon: "Briefcase",
    layoutKey: "classic",
    themeKey: "forest",
    widgets: [
      { key: "about", order: 0 },
      { key: "testimonials", order: 1 },
      { key: "contact", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    id: "store",
    label: "Store",
    description: "Katalog link toko, pembayaran, dan kontak cepat.",
    icon: "ShoppingBag",
    layoutKey: "modern",
    themeKey: "sunset",
    widgets: [
      { key: "about", order: 0 },
      { key: "links", order: 1 },
      { key: "contact", order: 2 },
      { key: "donate", order: 3 },
      { key: "social", order: 4 },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Riwayat karya, timeline karier, dan skill.",
    icon: "FolderKanban",
    layoutKey: "minimal",
    themeKey: "default",
    widgets: [
      { key: "about", order: 0 },
      { key: "projects", order: 1 },
      { key: "gallery", order: 2 },
      { key: "timeline", order: 3 },
      { key: "skills", order: 4 },
      { key: "social", order: 5 },
      { key: "links", order: 6 },
    ],
  },
  {
    id: "musician",
    label: "Musician",
    description: "Now playing, embed lagu, dan galeri panggung.",
    icon: "Music",
    layoutKey: "modern",
    themeKey: "sunset",
    widgets: [
      { key: "about", order: 0 },
      { key: "spotify", order: 1 },
      { key: "embed", order: 2 },
      { key: "gallery", order: 3 },
      { key: "social", order: 4 },
      { key: "links", order: 5 },
    ],
  },
  {
    id: "student",
    label: "Student",
    description: "Skill, timeline pendidikan, dan link organisasi.",
    icon: "GraduationCap",
    layoutKey: "classic",
    themeKey: "default",
    widgets: [
      { key: "about", order: 0 },
      { key: "skills", order: 1 },
      { key: "timeline", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    id: "community",
    label: "Community",
    description: "Server Discord, FAQ, dan link gabung komunitas.",
    icon: "Users",
    layoutKey: "modern",
    themeKey: "forest",
    widgets: [
      { key: "about", order: 0 },
      { key: "discord", order: 1 },
      { key: "faq", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
];

export function getOnboardingPreset(id: string): OnboardingPreset | undefined {
  return ONBOARDING_PRESETS.find((p) => p.id === id);
}
