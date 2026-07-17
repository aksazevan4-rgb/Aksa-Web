# AKSA Platform Revision — Implementation Guide

Paket ini berisi seluruh file revisi sesuai Master Revision Plan, Phase 0–2.
Semua file menggunakan path yang sama dengan project asli — tinggal **copy-paste / overwrite** ke project Next.js kamu.

---

## ⚠️ Sebelum Mulai

1. **Backup project asli kamu** (atau pastikan git commit bersih) sebelum overwrite apa pun.
2. File `prisma/schema.prisma` di paket ini adalah **versi gabungan**: model lama (Profile, Settings, dll) dipertahankan + model baru ditambahkan (PremiumPlan, PremiumFeature, SiteConfig, dll). **Cek dulu** apakah field di model lama (terutama `EcosystemNode`, `Project`, `TechItem`) cocok dengan schema asli kamu — beberapa nama field mungkin perlu disesuaikan manual karena saya tidak punya akses penuh ke seed.ts asli yang memakai field seperti `slug`, `statLabel`, dll yang tidak ada di file Profile/Project audit awal saya.

   **Rekomendasi aman**: jangan langsung overwrite `schema.prisma` asli. Bandingkan dulu dengan diff, lalu tambahkan model baru (`PremiumPlan`, `PremiumFeature`, `PremiumPlanFeature`, `SiteConfig`) plus field baru di `User` (`discordId`, `discordLinked`, `profileLayout`, `profileBackground`, `widgetConfig`) ke schema asli kamu secara manual.

---

## 📋 Urutan Implementasi

### 1. Database (wajib pertama)

```bash
# Setelah update schema.prisma dengan model baru:
npx prisma migrate dev --name add_premium_system_and_site_config
npx prisma generate

# Seed data Premium Plans/Features + SiteConfig default:
npx tsx prisma/seed-premium.ts
```

### 2. Copy file-file berikut (sudah final, tinggal pakai)

**Lib (logic inti):**
- `lib/site-config.ts` — baru
- `lib/premium-features.ts` — baru
- `lib/lanyard.ts` — baru
- `lib/widget-registry.ts` — baru
- `lib/premium.ts` — **overwrite** (sekarang jadi legacy wrapper, lihat komentar di file)
- `lib/profile-themes.ts` — **overwrite** (extended dengan layout + background system)

**App root:**
- `app/layout.tsx` — **overwrite** (metadata sekarang dari SiteConfig, bukan hardcode)
- `app/page.tsx` — **overwrite total** (landing page platform, bukan portfolio)
- `app/sitemap.ts` — baru
- `app/robots.ts` — baru

**Public profile:**
- `app/[username]/page.tsx` — **overwrite total** (widget system + Discord + DB-driven premium)

**Landing page components (baru semua):**
- `components/landing/LandingNavbar.tsx`
- `components/landing/LandingHero.tsx`
- `components/landing/LandingFeatures.tsx`
- `components/landing/LandingHowItWorks.tsx`
- `components/landing/LandingDiscord.tsx`
- `components/landing/LandingPricing.tsx`
- `components/landing/LandingProfiles.tsx`
- `components/landing/LandingAksaIdShowcase.tsx`
- `components/landing/LandingFooter.tsx`

**Dashboard:**
- `app/dashboard/page.tsx` — **overwrite** (visual upgrade, fix branding)
- `components/dashboard/Sidebar.tsx` — **overwrite** (fix branding, fix "Tombol Link" → proper labels, tambah Premium/Konfigurasi admin nav)
- `components/dashboard/DashboardStatsGrid.tsx` — baru (animated stat cards)
- `components/ui/Skeleton.tsx` — baru (loading states, pakai di halaman yang fetch data)

**Profile management:**
- `app/dashboard/profile/data.ts` — **overwrite** (16 social platforms, was 6)
- `app/dashboard/profile/ProfileForm.tsx` — **overwrite** (Discord ID field, categorized socials, fix "ala Linktree")
- `app/dashboard/profile/links/page.tsx` — **overwrite** (pakai `getLinkLimit()` DB-driven, bukan hardcode `FREE_LINK_LIMIT`)

**Discord integration:**
- `app/api/discord/presence/route.ts` — baru
- `components/profile/widgets/DiscordWidget.tsx` — baru

**Admin — Premium management:**
- `app/dashboard/admin/premium/page.tsx` — baru
- `app/dashboard/admin/premium/actions.ts` — baru
- `app/dashboard/admin/premium/PremiumPlansClient.tsx` — baru

**Admin — Site config:**
- `app/dashboard/admin/config/page.tsx` — baru
- `app/dashboard/admin/config/actions.ts` — baru
- `app/dashboard/admin/config/SiteConfigForm.tsx` — baru

### 3. Sesuaikan `Topbar.tsx` dan `Navbar.tsx` (tidak termasuk paket ini)

Dua file ini masih punya hardcode "AKSA.ID" yang perlu di-fix manual:
- `components/Navbar.tsx` → ganti teks `AKSA<span className="text-blue">.</span>ID` jadi `{siteName}` (ambil dari `getSiteConfig()` di page yang memanggilnya), atau pakai pendekatan sama seperti `LandingNavbar.tsx` yang sudah saya buat (terima `siteName` sebagai prop).
- File asli `Navbar.tsx` punya nav items yang juga personal-portfolio (`#ecosystem`, `#projects`, `#stack`) — kalau halaman portfolio lama masih dipakai di route lain, biarkan; tapi untuk home page baru, dia digantikan total oleh `LandingNavbar.tsx`.

### 4. Pasang field Discord di action `updateProfile`

File `app/dashboard/profile/actions.ts` (tidak termasuk paket ini karena saya tidak bisa membaca isi lengkapnya) perlu menerima field baru:
```ts
const discordId = formData.get("discordId") as string | null;
// ...
await prisma.user.update({
  where: { id: user.id },
  data: {
    // ...existing fields,
    discordId: discordId || null,
    discordLinked: Boolean(discordId),
  },
});
```

### 5. Tambah halaman `/dashboard/profile/appearance` (Phase 2, belum dibuat)

Halaman ini direferensikan dari `ProfileForm.tsx` dan `Sidebar.tsx` tapi belum saya buat filenya — ini untuk layout picker, background picker, dan widget on/off toggle. Sesuai roadmap, ini masuk Phase 2 lanjutan. Beri tahu saya kalau mau saya lanjutkan generate halaman ini berikutnya.

### 6. Environment variable baru

```env
# Opsional — kalau pakai Lanyard self-hosted, default ke api.lanyard.rest
LANYARD_API_URL=https://api.lanyard.rest/v1

# Dipakai oleh getSiteConfig() sebagai fallback siteUrl
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## ✅ Checklist Branding Fix (Phase 0) — sudah selesai di paket ini

- [x] `app/layout.tsx` — metadata sekarang dari `SiteConfig`, bukan hardcode "Aksa Zevan..."
- [x] `app/[username]/page.tsx` — "Powered by AKSA.ID" → "Powered by {siteName}" (dinamis)
- [x] `app/[username]/page.tsx` — `isPremiumProfile` hardcode dihapus, ganti `hasFeatureAccess()` DB-driven
- [x] `app/dashboard/page.tsx` — "aksa.id/{username}" hardcode → dinamis dari `SiteConfig.siteUrl`
- [x] `app/dashboard/page.tsx` & `Sidebar.tsx` — "Tombol Link" + "ala Linktree" dihapus
- [x] `LandingNavbar.tsx` — branding "AKSA.ID" → "AKSA" (siteName dari config)
- [ ] `components/Navbar.tsx` (lama) — **belum**, lihat poin 3 di atas
- [ ] `components/dashboard/Topbar.tsx` — tidak ada hardcode branding ditemukan, aman

---

## 🗂️ Status sebenarnya (terakhir diverifikasi — lihat catatan sesi terbaru)

Bagian di bawah ini sebelumnya menulis beberapa file sebagai "belum dibuat" —
itu sudah tidak akurat. Semua file berikut **sudah ada** di project:

- `app/dashboard/profile/appearance/page.tsx` + `LayoutPicker`/`BackgroundPicker`/`WidgetManager` ✅
- Layout components: `ClassicLayout`, `ModernLayout`, `GlassLayout`, `MinimalLayout` ✅
  (masih 4 dari ~18 gaya yang diminta di brief awal — Cyber/Neon/Gaming/dll masih beneran belum ada)
- Widget components selain Discord: `AboutWidget`, `StatusWidget`, `SkillsWidget`,
  `ProjectsWidget`, `TestimonialsWidget`, `ContactWidget`, `DonateWidget`,
  `VisitorCountWidget`, `GalleryWidget` ✅ (Gallery baru ditambahkan sesi ini)
- `app/dashboard/analytics/page.tsx` ✅
- `app/dashboard/admin/showcase/` ✅
- `app/og/route.tsx` ✅

**Yang sebenarnya rusak (ditemukan lewat audit, sudah diperbaiki sesi ini):**
Widget-widget di atas punya komponen, punya editor konten, dan tersimpan
dengan benar ke DB — tapi 4 layout hanya benar-benar me-render 4 widget
(`about`, `social`, `discord`, `links`). Sisanya (`status`, `skills`,
`projects`, `gallery`, `testimonials`, `visitor-count`, `contact`, `donate`)
tidak pernah muncul di profil publik meski sudah diaktifkan dari dashboard.
Ditambah, `toggleWidget()`/`reorderWidgets()` menimpa field `config` widget
setiap kali di-toggle/reorder — jadi konten yang sudah diisi user (skill list,
project list, dst) bisa hilang. Semua ini sudah diperbaiki:
lihat `components/profile/widgets/ExtraWidgets.tsx` (satu komponen shared
yang dipakai oleh keempat layout) dan perbaikan di
`app/dashboard/profile/appearance/actions.ts`.

Yang **masih benar-benar belum ada**:
- 14 gaya layout tambahan dari brief awal (Cyber, Neon, Gaming, Discord Style,
  Streamer, Portfolio, Creator, Full Width, Premium, Futuristic, Compact, dll)
- Background system lanjutan (Aurora, Mesh Gradient, Galaxy, Particles, Parallax,
  Video Background) — saat ini baru solid/gradient/image dasar
- Border system (per brief: None/Soft/Glow/Neon/Animated/Rainbow/dll)
- Widget: FAQ, Timeline, Achievement, Embed, Custom HTML, Music (non-Discord)
- Custom Discord bot masih scaffold (`discord-bot/index.ts` client-nya di-comment,
  perlu di-deploy manual sebagai proses terpisah — lihat bagian Phase 3 di bawah)

---

## 🗂️ Apa yang TIDAK termasuk di paket ini (belum dibuat) — CATATAN LAMA, lihat bagian di atas untuk status akurat

Sesuai roadmap Phase 2–3 di Master Plan, berikut yang belum digenerate — beri tahu saya kalau ingin saya lanjutkan:

- `app/dashboard/profile/appearance/page.tsx` — layout/background/widget picker UI
- Layout components (`components/profile/layouts/Classic.tsx`, `Modern.tsx`, `Glass.tsx`, `Minimal.tsx`)
- Widget components selain Discord (`AboutWidget`, `StatusWidget`, `SkillsWidget`, dll)
- `app/dashboard/analytics/page.tsx` — halaman analitik lanjutan
- Admin showcase management (`app/dashboard/admin/showcase/`)
- OG image dinamis (`app/og/route.tsx`)
- Custom Discord bot (saat ini pakai Lanyard API sebagai shortcut MVP)

---

## 📝 Catatan Teknis Penting

1. **`getUserFeatures()` dan `hasFeatureAccess()`** di `lib/premium-features.ts` adalah satu-satunya tempat untuk cek akses fitur premium. Jangan tambah hardcode baru di komponen manapun.
2. **`getSiteConfig()`** di-cache 120 detik via `unstable_cache`. Setiap kali admin update config, panggil `revalidateTag("site-config")` (sudah ada di `actions.ts`).
3. **Lanyard API** butuh user join ke server Discord Lanyard (`discord.gg/lanyard`) supaya botnya bisa baca presence. Ini batasan dari layanan gratis — kalau mau full kontrol, perlu bangun bot sendiri (Phase 3 di roadmap).
4. Semua komponen baru sudah pakai pola desain yang sama dengan project asli (`glass`, `glass-bright`, `text-gradient`, dll dari `globals.css`) — tidak ada CSS baru yang perlu ditambahkan.

---

## Phase 3 — Tambahan (Sesi Ini)

### File baru Phase 3

| File | Fungsi |
|---|---|
| `app/dashboard/layout.tsx` | Fixed: pakai SiteConfig bukan legacy Settings |
| `components/dashboard/Topbar.tsx` | Fixed branding + menu baru (Tampilan, Widget, Analitik) |
| `app/dashboard/profile/page.tsx` | Fixed: kirim `profileHost` dari SiteConfig |
| `app/dashboard/profile/actions.ts` | Fixed: simpan `discordId` + `discordLinked` |
| `components/PremiumGate.tsx` | Rewrite: database-driven, tidak hardcode plan |
| `app/dashboard/admin/users/actions.ts` | Grant/revoke premium, ban/unban, hapus user via server actions |
| `app/dashboard/admin/users/AdminUsersClient.tsx` | UI lengkap: toggle premium, role, status, hapus |
| `app/dashboard/admin/analytics/page.tsx` | Platform analytics (total user, views, clicks, top profiles) |
| `app/dashboard/admin/analytics/AdminAnalyticsClient.tsx` | Animated stats + top profiles table |
| `app/api/discord/bot/webhook/route.ts` | Custom bot webhook receiver dengan HMAC signature |
| `discord-bot/index.ts` | Discord bot starter (discord.js v14) |
| `discord-bot/package.json` | Bot dependencies |
| `discord-bot/.env.example` | Template env vars untuk bot |
| `app/api/profile/view/route.ts` | Daily view tracking endpoint |
| `app/l/[linkId]/route.ts` | Link click tracker + redirect |
| `middleware.ts` | Maintenance mode gate |
| `app/maintenance/page.tsx` | Halaman maintenance |
| `app/globals-additions.css` | CSS additions: animations, utilities |
| `prisma/migrations-guide.md` | Panduan tambah ProfileViewLog + DiscordBotConfig model |

### Cara aktifkan Click Tracking

File `app/l/[linkId]/route.ts` sudah dibuat. Yang perlu dilakukan:

Di semua layout components (`ClassicLayout`, `ModernLayout`, dll), link button sudah pakai `/l/${link.id}`.
Itu sudah benar — setiap klik otomatis ter-track.

### Cara aktifkan Discord Custom Bot (Phase 3)

1. Buat bot di [discord.dev](https://discord.com/developers)
2. Enable **Presence Intent** dan **Server Members Intent**
3. Copy `discord-bot/` ke folder terpisah
4. `cd discord-bot && npm install && cp .env.example .env`
5. Isi env vars, uncomment kode di `index.ts`
6. Tambah `DISCORD_BOT_WEBHOOK_SECRET` ke `.env.local` Next.js app

Selama Phase 3 belum aktif, Lanyard API (`/api/discord/presence`) tetap dipakai sebagai fallback.

### Cara aktifkan Maintenance Mode

Set `MAINTENANCE_MODE=true` di `.env.local` + redeploy.
Untuk production tanpa redeploy: integrasikan dengan Vercel Edge Config.


---

## Sesi Terakhir — Kelengkapan Final

### File tambahan sesi ini

| File | Keterangan |
|---|---|
| `components/LinkIcon.tsx` | Extended — 20 platform (sebelumnya 12), semua dari data.ts |
| `app/dashboard/profile/links/ProfileLinksClient.tsx` | Fixed: hapus "Linktree" dari copy, support `linkLimit` prop dari DB |
| `app/dashboard/admin/page.tsx` | Updated: link ke Premium, Analytics, Showcase, Konfigurasi |
| `app/dashboard/settings/page.tsx` | Updated: tambah Premium section di atas |
| `app/dashboard/settings/PremiumSection.tsx` | Baru: status plan, upgrade prompt, expiry info |
| `components/dashboard/Sidebar.tsx` | Fix: hapus `Star` typo, tambah "Widget" nav item |

### Cara ikut upgrade flow (untuk user FREE)

1. User buka `/dashboard/settings#premium`
2. Klik "Upgrade ke Premium" → redirect ke Discord AKSA.ID
3. Proses via Discord (bayar, konfirmasi)
4. Admin buka `/dashboard/admin/users`
5. Cari user → klik ikon Crown → plan berubah ke PREMIUM
6. `revalidateTag("premium-features")` otomatis dipanggil → efek langsung

### Semua referensi "Linktree" yang sudah dihapus

- ❌ `"Kelola link ala Linktree"` → `"Tombol link yang muncul di profil publikmu."`
- ❌ `"Tombol Link"` (heading) → `"Link Manager"`
- ❌ `FREE_LINK_LIMIT` hardcode dari `lib/premium.ts` → `getLinkLimit()` dari DB
- ❌ `isPremiumProfile` hardcode `user.plan === "PREMIUM"` → `hasFeatureAccess()` DB-driven
- ❌ `"aksa.id/{username}"` hardcode → dinamis dari `SiteConfig.siteUrl`
- ❌ Metadata `"AKSA.ID"` → `config.siteName` dinamis dari SiteConfig

### Checklist final sebelum deploy

- [ ] `npx prisma migrate dev --name add_premium_system_and_site_config`
- [ ] `npx prisma generate`
- [ ] `npx tsx prisma/seed-premium.ts`
- [ ] Tambah `globals-additions.css` ke bawah `globals.css`
- [ ] Tambah `discordId`, `discordLinked`, `profileLayout`, `profileBackground`, `widgetConfig` ke `User` model di schema
- [ ] Tambah `PremiumPlan`, `PremiumFeature`, `PremiumPlanFeature`, `SiteConfig` models ke schema
- [ ] Fix `Navbar.tsx` lama (bukan `LandingNavbar.tsx`) — ganti teks hardcode "AKSA.ID" → pakai `siteName` prop
- [ ] Upload `aksa-logo.png` ke `/public/`
- [ ] Set `NEXT_PUBLIC_APP_URL` di `.env.local`
- [ ] (Opsional) Set `DISCORD_BOT_WEBHOOK_SECRET` untuk Phase 3 bot
