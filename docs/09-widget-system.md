# 09 — Widget System
## AKSA AboutMe

> Basis existing: field `widgetConfig` (User), `WidgetManager.tsx`. Dokumen ini mendefinisikan arsitektur SDK/Builder/Store penuh, bertumpu pada model `WidgetDefinition`/`WidgetInstance` dari dokumen 04 §2.2.

---

## 1. Widget SDK (Internal Contract)

Setiap widget didefinisikan sebagai modul yang mengimplementasikan kontrak sama, terlepas dari jenisnya:

```ts
interface WidgetModule {
  key: string;                       // unik, cocok dengan WidgetDefinition.key
  configSchema: ZodSchema;           // validasi config instance
  ServerRenderer?: React.FC<{config}>;  // untuk widget yang butuh data server (Discord presence, dst)
  ClientRenderer?: React.FC<{config}>;  // untuk widget interaktif (clock, countdown)
  PreviewThumbnail: React.FC;        // ditampilkan di Widget Library
  defaultConfig: Record<string, unknown>;
}
```

Semua widget baru didaftarkan ke satu **registry** (`features/widgets/registry.ts`) — bukan tersebar sebagai kondisional if/else di banyak file (mencegah duplicate logic, dokumen 18).

---

## 2. Widget Builder — Perilaku

- **Drag & Drop** reorder antar widget aktif (memakai library drag-drop yang sudah cocok dengan Framer Motion, konsisten dengan Link Management dokumen 08).
- **Resize** — untuk widget yang mendukung ukuran variabel (Gallery, Statistics), dengan snap-to-grid agar layout tetap rapi.
- **Duplicate, Hide, Disable** — hide menyembunyikan dari publik tanpa menghapus config; disable mematikan proses render (mis. widget yang datanya sedang bermasalah) tanpa kehilangan posisi di layout.
- **Preview** langsung di panel builder (memakai `PreviewThumbnail` + live data sample), dan opsi "Lihat di Live Preview penuh" (terhubung ke Theme Builder dokumen 07 §2).
- **Search, Filter, Group, Favorite** di Widget Library — sama pola dengan Icon Picker (dokumen 08 §1) untuk konsistensi UX pencarian di seluruh produk.

---

## 3. Widget Library — Kategori & Daftar

| Kategori | Widget |
|---|---|
| Integrasi Platform | Discord Presence, Spotify Now Playing, GitHub Contribution Graph, Steam Status, Roblox Profile, Twitch Live Status, YouTube Latest Video, TikTok Feed, Instagram Grid |
| Konten Kreatif | Gallery, Timeline, Achievement Showcase, Projects Grid, Skills Bar |
| Engagement | Music Player, Donate Button, Guestbook (sudah ada modelnya — `GuestbookEntry`), Testimonials (sudah ada `Testimonial` model), FAQ |
| Data & Utilitas | Statistics, Countdown, Weather, Clock, Calendar, Crypto Ticker, RSS Feed |
| Lanjutan | Custom HTML (hanya untuk plan premium tertentu, di-sandbox via `iframe` sandboxed — tidak pernah dirender sebagai HTML mentah langsung di halaman utama, demi keamanan XSS) |

---

## 4. Widget Configuration

- Setiap `WidgetDefinition.configSchema` (JSON-schema) di-generate otomatis menjadi form config di Widget Builder (form generik yang membaca schema — bukan form custom-coded per widget, memenuhi prinsip reuse dokumen 18).
- Widget yang butuh koneksi eksternal (Spotify, Discord, GitHub) memerlukan OAuth scope tambahan yang diminta terpisah dari OAuth login utama (dokumen 05), dengan penjelasan jelas kenapa izin tersebut dibutuhkan sebelum user connect.

---

## 5. Widget Permission

- Widget yang menampilkan data personal (Spotify now-playing, Discord presence) tunduk pada **Profile Visibility** (`ProfileVisibility` enum existing) dan toggle privasi khusus per widget (mis. "Sembunyikan saat sedang di voice channel privat").
- Widget premium ditandai `isPremium` di `WidgetDefinition`, dicek server-side saat `enable` (Server Action), bukan hanya disembunyikan dari UI non-premium.

---

## 6. Widget Analytics

- Interaksi widget (klik tombol donate, klik lagu di music player) tercatat sebagai `AnalyticsEvent type=widget_interact` dengan `targetId` = widget instance id — masuk ke pipeline yang sama dengan dokumen 03 §10, muncul di breakdown Analytics dashboard (dokumen 06 §4) per widget.

---

## 7. Widget Store / Marketplace Integration

- Widget preset (kombinasi config siap pakai, bukan widget baru) bisa dipublikasikan ke Marketplace (dokumen 13) sebagai `MarketplaceListing type=WIDGET_PRESET` — pengguna lain bisa import preset config, bukan kode widget itu sendiri (menjaga keamanan — tidak ada eksekusi kode arbitrer dari marketplace).

---

## 8. Performa Widget

- Widget dengan dependency eksternal (fetch Spotify/Discord API) di-Suspense terpisah (dokumen 02 §8) agar satu widget lambat tidak memblokir render seluruh halaman profil.
- Widget yang tidak terlihat di viewport (below the fold) di-lazy-render (`IntersectionObserver`) untuk widget berat (Gallery besar, embed eksternal).

---

**Selanjutnya:** Dokumen **10 — Badge System** (Badge Engine, requirement, showcase, marketplace badge).
