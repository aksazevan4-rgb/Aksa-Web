/**
 * lib/widget-registry.ts
 *
 * Registry of all widgets that can appear on a public profile page.
 * Adding a new widget = add an entry here + create the component in
 * components/profile/widgets/. No changes needed to the rendering pipeline.
 *
 * Widget visibility/order is stored in User.widgetConfig as JSON:
 *   { [widgetKey]: { enabled: boolean, order: number, config?: object } }
 */
import { Prisma } from "@prisma/client";

export interface WidgetDefinition {
  key: string;
  label: string;
  description: string;
  /** Premium feature key required, or null if free for all users. */
  premiumFeatureKey: string | null;
  /** Default enabled state for new users. */
  defaultEnabled: boolean;
  defaultOrder: number;
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    key: "about",
    label: "About Me",
    description: "Bio singkat tentang dirimu.",
    premiumFeatureKey: null,
    defaultEnabled: true,
    defaultOrder: 0,
  },
  {
    key: "status",
    label: "Status",
    description: "Status custom yang bisa kamu ubah kapan saja.",
    premiumFeatureKey: null,
    defaultEnabled: false,
    defaultOrder: 1,
  },
  {
    key: "discord",
    label: "Discord Presence",
    description: "Status online, custom status Discord secara real-time.",
    premiumFeatureKey: null,
    defaultEnabled: false,
    defaultOrder: 2,
  },
  {
    key: "discord-activity",
    label: "Discord Activity",
    description: "Game yang dimainkan, rich presence aplikasi lain.",
    premiumFeatureKey: "widget_discord_activity",
    defaultEnabled: false,
    defaultOrder: 3,
  },
  {
    key: "spotify",
    label: "Spotify Now Playing",
    description: "Lagu yang sedang diputar via Discord.",
    premiumFeatureKey: "widget_spotify",
    defaultEnabled: false,
    defaultOrder: 4,
  },
  {
    key: "social",
    label: "Social Links",
    description: "Ikon link ke media sosialmu.",
    premiumFeatureKey: null,
    defaultEnabled: true,
    defaultOrder: 5,
  },
  {
    key: "links",
    label: "Link Buttons",
    description: "Tombol link custom (dahulu disebut 'tombol link').",
    premiumFeatureKey: null,
    defaultEnabled: true,
    defaultOrder: 6,
  },
  {
    key: "skills",
    label: "Skills",
    description: "Daftar kemampuan atau keahlian.",
    premiumFeatureKey: "widget_skills",
    defaultEnabled: false,
    defaultOrder: 7,
  },
  {
    key: "projects",
    label: "Projects",
    description: "Showcase proyek atau karya.",
    premiumFeatureKey: "widget_projects",
    defaultEnabled: false,
    defaultOrder: 8,
  },
  {
    key: "gallery",
    label: "Gallery",
    description: "Galeri foto.",
    premiumFeatureKey: "widget_gallery",
    defaultEnabled: false,
    defaultOrder: 9,
  },
  {
    key: "visitor-count",
    label: "Visitor Count",
    description: "Tampilkan jumlah pengunjung profil.",
    premiumFeatureKey: "widget_visitor_count",
    defaultEnabled: false,
    defaultOrder: 10,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Testimoni dari orang lain.",
    premiumFeatureKey: "widget_testimonials",
    defaultEnabled: false,
    defaultOrder: 11,
  },
  {
    key: "contact",
    label: "Contact",
    description: "Form kontak singkat.",
    premiumFeatureKey: "widget_contact",
    defaultEnabled: false,
    defaultOrder: 12,
  },
  {
    key: "donate",
    label: "Donate / Support",
    description: "Link donasi (Saweria, Trakteer, PayPal, custom).",
    premiumFeatureKey: "widget_donate",
    defaultEnabled: false,
    defaultOrder: 13,
  },
  {
    key: "timeline",
    label: "Timeline",
    description: "Riwayat kronologis — karier, pendidikan, milestone.",
    premiumFeatureKey: "widget_timeline",
    defaultEnabled: false,
    defaultOrder: 14,
  },
  {
    key: "achievement",
    label: "Achievement",
    description: "Pencapaian atau penghargaan dalam bentuk badge.",
    premiumFeatureKey: "widget_achievement",
    defaultEnabled: false,
    defaultOrder: 15,
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Pertanyaan yang sering ditanyakan, format accordion.",
    premiumFeatureKey: "widget_faq",
    defaultEnabled: false,
    defaultOrder: 16,
  },
  {
    key: "embed",
    label: "Embed",
    description: "Sematkan video YouTube, track Spotify/SoundCloud, atau Figma.",
    premiumFeatureKey: "widget_embed",
    defaultEnabled: false,
    defaultOrder: 17,
  },
  {
    key: "custom-html",
    label: "Custom HTML",
    description: "HTML custom (disaring otomatis demi keamanan pengunjung).",
    premiumFeatureKey: "widget_custom_html",
    defaultEnabled: false,
    defaultOrder: 18,
  },
  {
    key: "guestbook",
    label: "Guestbook",
    description: "Pengunjung bisa tinggalkan pesan singkat di profilmu.",
    premiumFeatureKey: "widget_guestbook",
    defaultEnabled: false,
    defaultOrder: 19,
  },
  {
    key: "reactions",
    label: "Reactions",
    description: "Pengunjung bisa kasih reaksi emoji ke profilmu.",
    premiumFeatureKey: "widget_reactions",
    defaultEnabled: false,
    defaultOrder: 20,
  },
  // ── Fase 2 (docs/09-widget-system.md §3) — kategori Data & Utilitas ──
  {
    key: "countdown",
    label: "Countdown",
    description: "Hitung mundur ke tanggal/acara tertentu.",
    premiumFeatureKey: null,
    defaultEnabled: false,
    defaultOrder: 21,
  },
  {
    key: "clock",
    label: "Clock",
    description: "Jam real-time, bisa custom timezone.",
    premiumFeatureKey: null,
    defaultEnabled: false,
    defaultOrder: 22,
  },
  {
    key: "statistics",
    label: "Statistics",
    description: "Ringkasan angka: profile views, link clicks, badge dimiliki.",
    premiumFeatureKey: "widget_statistics",
    defaultEnabled: false,
    defaultOrder: 23,
  },
  {
    key: "github-graph",
    label: "GitHub Contribution",
    description: "Grafik kontribusi GitHub publik.",
    premiumFeatureKey: "widget_github_graph",
    defaultEnabled: false,
    defaultOrder: 24,
  },
  {
    key: "crypto-ticker",
    label: "Crypto Ticker",
    description: "Harga BTC/ETH/SOL real-time (cache Redis, docs/03 §3).",
    premiumFeatureKey: "widget_crypto_ticker",
    defaultEnabled: false,
    defaultOrder: 25,
  },
  {
    key: "rss-feed",
    label: "RSS Feed",
    description: "Judul artikel terbaru dari feed RSS pilihanmu.",
    premiumFeatureKey: "widget_rss_feed",
    defaultEnabled: false,
    defaultOrder: 26,
  },
];

export type WidgetConfig = {
  enabled: boolean;
  order: number;
  config?: Prisma.InputJsonValue;
};

export type WidgetConfigMap = Record<string, WidgetConfig>;

/** A registry entry merged with the user's stored overrides (enabled/order/config). */
export interface ActiveWidget extends WidgetDefinition {
  config?: Prisma.InputJsonValue;
}

/** Merge stored config with registry defaults, return sorted enabled widgets. */
export function resolveActiveWidgets(
  stored: WidgetConfigMap | null | undefined,
  accessibleFeatureKeys: string[]
): ActiveWidget[] {
  return WIDGET_REGISTRY
    .map((widget): ActiveWidget => {
      const override = stored?.[widget.key];
      const enabled = override?.enabled ?? widget.defaultEnabled;
      const order = override?.order ?? widget.defaultOrder;
      return { ...widget, defaultEnabled: enabled, defaultOrder: order, config: override?.config };
    })
    .filter((widget) => {
      if (!widget.defaultEnabled) return false;
      if (widget.premiumFeatureKey && !accessibleFeatureKeys.includes(widget.premiumFeatureKey)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.defaultOrder - b.defaultOrder);
}
