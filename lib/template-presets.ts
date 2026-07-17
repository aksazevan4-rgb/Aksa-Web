/**
 * lib/template-presets.ts
 *
 * Fase 5 — Template Marketplace. These are the built-in (isBuiltIn: true)
 * templates seeded into ProfileTemplate on first read (see
 * app/dashboard/profile/templates/actions.ts -> ensureBuiltInTemplates()).
 * Users can additionally create, save, share (PUBLIC/UNLISTED), and later
 * price their own templates — this file only covers the platform-provided
 * starter set requested for the marketplace.
 */

export interface TemplatePreset {
  slug: string;
  name: string;
  category: string;
  description: string;
  layoutKey: string;
  themeKey: string;
  borderKey: string;
  fontKey: string;
  backgroundConfig: { type: string; colors?: string[] };
  widgets: { key: string; order: number }[];
}

export const BUILT_IN_TEMPLATES: TemplatePreset[] = [
  {
    slug: "gaming",
    name: "Gaming",
    category: "Gaming",
    description: "Discord presence, achievement, dan nuansa particle gelap.",
    layoutKey: "modern",
    themeKey: "midnight",
    borderKey: "neon",
    fontKey: "space-grotesk",
    backgroundConfig: { type: "particles", colors: ["#0a0a1a", "#1a1a3a"] },
    widgets: [
      { key: "discord", order: 0 },
      { key: "discord-activity", order: 1 },
      { key: "achievement", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "developer",
    name: "Developer",
    category: "Developer",
    description: "Skills, proyek, dan embed — untuk showcase kode.",
    layoutKey: "modern",
    themeKey: "midnight",
    borderKey: "soft",
    fontKey: "space-grotesk",
    backgroundConfig: { type: "gradient", colors: ["#0a0a12", "#141420"] },
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
    slug: "business",
    name: "Business",
    category: "Business",
    description: "Testimoni klien, kontak, dan kesan profesional.",
    layoutKey: "classic",
    themeKey: "forest",
    borderKey: "soft",
    fontKey: "inter",
    backgroundConfig: { type: "gradient", colors: ["#08140f", "#0d1f18"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "testimonials", order: 1 },
      { key: "contact", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "portfolio",
    name: "Portfolio",
    category: "Portfolio",
    description: "Timeline karier, proyek, dan galeri — bersih dan fokus.",
    layoutKey: "minimal",
    themeKey: "default",
    borderKey: "soft",
    fontKey: "manrope",
    backgroundConfig: { type: "solid", colors: ["#0a0a0f"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "projects", order: 1 },
      { key: "timeline", order: 2 },
      { key: "gallery", order: 3 },
      { key: "social", order: 4 },
      { key: "links", order: 5 },
    ],
  },
  {
    slug: "anime",
    name: "Anime",
    category: "Anime",
    description: "Pill link warna-warni dengan aksen rose gold playful.",
    layoutKey: "creator",
    themeKey: "rosegold",
    borderKey: "dashed",
    fontKey: "poppins",
    backgroundConfig: { type: "gradient", colors: ["#1a0f14", "#2a1620"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "gallery", order: 1 },
      { key: "social", order: 2 },
      { key: "links", order: 3 },
    ],
  },
  {
    slug: "cyberpunk",
    name: "Cyberpunk",
    category: "Cyberpunk",
    description: "Glass + border cyber + latar neon dua-warna.",
    layoutKey: "glass",
    themeKey: "cyber",
    borderKey: "cyber",
    fontKey: "space-grotesk",
    backgroundConfig: { type: "neon", colors: ["#0a1a1f", "#00e5ff", "#ff00aa"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "discord", order: 1 },
      { key: "embed", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "glass",
    name: "Glass",
    category: "Glass",
    description: "Full glassmorphism dengan aurora lembut di belakang.",
    layoutKey: "glass",
    themeKey: "default",
    borderKey: "glass",
    fontKey: "inter",
    backgroundConfig: { type: "aurora", colors: ["#141428", "#1e1440"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "social", order: 1 },
      { key: "links", order: 2 },
    ],
  },
  {
    slug: "luxury",
    name: "Luxury",
    category: "Luxury",
    description: "Rose gold + border gradient + tipografi Syne yang elegan.",
    layoutKey: "classic",
    themeKey: "rosegold",
    borderKey: "gradient",
    fontKey: "syne",
    backgroundConfig: { type: "gradient", colors: ["#1a1410", "#2a2015"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "testimonials", order: 1 },
      { key: "gallery", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "apple",
    name: "Apple",
    category: "Apple",
    description: "Hitam pekat, tanpa border, tipografi minim — sangat clean.",
    layoutKey: "minimal",
    themeKey: "default",
    borderKey: "none",
    fontKey: "inter",
    backgroundConfig: { type: "solid", colors: ["#000000"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "faq", order: 1 },
      { key: "social", order: 2 },
      { key: "links", order: 3 },
    ],
  },
  {
    slug: "spotify",
    name: "Spotify",
    category: "Spotify",
    description: "Now-playing jadi pusat perhatian, aksen hijau gelap.",
    layoutKey: "modern",
    themeKey: "forest",
    borderKey: "soft",
    fontKey: "dm-sans",
    backgroundConfig: { type: "gradient", colors: ["#0a1f12", "#0a0a0a"] },
    widgets: [
      { key: "spotify", order: 0 },
      { key: "about", order: 1 },
      { key: "embed", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "discord",
    name: "Discord",
    category: "Discord",
    description: "Presence Discord besar di atas, warna blurple-midnight.",
    layoutKey: "modern",
    themeKey: "midnight",
    borderKey: "soft",
    fontKey: "inter",
    backgroundConfig: { type: "gradient", colors: ["#1e1f26", "#12131a"] },
    widgets: [
      { key: "discord", order: 0 },
      { key: "discord-activity", order: 1 },
      { key: "about", order: 2 },
      { key: "social", order: 3 },
      { key: "links", order: 4 },
    ],
  },
  {
    slug: "neon",
    name: "Neon",
    category: "Neon",
    description: "Pill link, border neon menyala, latar dua-warna terang.",
    layoutKey: "creator",
    themeKey: "neon",
    borderKey: "neon",
    fontKey: "syne",
    backgroundConfig: { type: "neon", colors: ["#0a0a14", "#e879f9", "#22d3ee"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "social", order: 1 },
      { key: "links", order: 2 },
    ],
  },
  {
    slug: "minimal",
    name: "Minimal",
    category: "Minimal",
    description: "Tanpa dekorasi — cuma tipografi dan daftar link rapi.",
    layoutKey: "minimal",
    themeKey: "default",
    borderKey: "none",
    fontKey: "inter",
    backgroundConfig: { type: "solid", colors: ["#0a0a0f"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "links", order: 1 },
    ],
  },
  {
    slug: "retro",
    name: "Retro",
    category: "Retro",
    description: "Border double, palet sunset, layout compact bergaya lawas.",
    layoutKey: "compact",
    themeKey: "sunset",
    borderKey: "double",
    fontKey: "outfit",
    backgroundConfig: { type: "gradient", colors: ["#2a1810", "#3a2418"] },
    widgets: [
      { key: "about", order: 0 },
      { key: "gallery", order: 1 },
      { key: "social", order: 2 },
      { key: "links", order: 3 },
    ],
  },
];
