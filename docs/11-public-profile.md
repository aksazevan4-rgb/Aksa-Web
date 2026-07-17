# 11 — Public Profile
## AKSA AboutMe

> Basis existing: `app/[username]/page.tsx`, `public-actions.ts`, `ProfileViewLog`, komponen `*View.tsx` (HeroView, AboutView, dst.), integrasi Discord presence (`discordPresenceCache`) dan `app/og/route.tsx` untuk OG image. Dokumen ini melengkapi sisi premium/dinamis sesuai spek.

---

## 1. Rendering Strategy

- Server Component sebagai default, data inti (nama, bio, links, badge) di-fetch server-side untuk SEO penuh dan LCP cepat.
- Widget berat/eksternal (Discord presence, Spotify presence, live counters) di-stream via Suspense terpisah (dokumen 02 §8), tidak memblokir first paint konten inti.

---

## 2. Dynamic & Video Background

- Diambil dari `profileBackground: Json` (existing) — diperluas mendukung tipe `image | gradient | video`.
- Video background: autoplay muted, loop, dengan poster fallback image untuk device yang memblokir autoplay atau koneksi lambat (deteksi `navigator.connection` bila tersedia, fallback ke image statis).
- Ukuran video dibatasi & dikompresi via Cloudinary pipeline existing sebelum disimpan.

---

## 3. Live Widgets di Halaman Publik

- **Discord Presence** — memakai `discordPresenceCache`/webhook bot existing (`app/api/discord/bot/webhook/route.ts`, `app/api/discord/presence/route.ts`), dengan `PRESENCE_CACHE_MAX_AGE_MS` yang sudah ada sebagai guard freshness.
- **Spotify Presence** — baru, OAuth scope tambahan (dokumen 05/09), menampilkan lagu yang sedang diputar dengan polling ringan (Redis-cached, TTL pendek, dokumen 03 §3) — tidak memanggil Spotify API di setiap page view langsung (mencegah rate-limit API pihak ketiga).
- **Typing Effect** untuk bio/tagline — animasi teks bergilir (Framer Motion), menghormati `prefers-reduced-motion`.
- **Animated Counters** — profile views, link clicks (angka menghitung naik saat masuk viewport), berbasis data real dari `ProfileViewLog`/`AnalyticsSummary`, bukan angka dummy.

---

## 4. Visitor & View Tracking

- `ProfileViewLog` (existing) tetap dipakai untuk mencatat kunjungan; ditambah dedup sederhana (satu view per IP+username per interval singkat, mis. 30 menit) agar `profileViews` tidak mudah di-inflate oleh refresh berulang.
- **Online Indicator** — dari `session:presence:{userId}` Redis key (dokumen 03 §3), TTL pendek sehingga otomatis "offline" saat user idle/keluar tanpa perlu event logout eksplisit.

---

## 5. Badge Showcase & Social Grid

- Area badge menampilkan `UserBadge.featured` (dokumen 10 §3) dengan layout card orisinal AKSA, hover menampilkan tooltip requirement/deskripsi.
- **Social Grid** — susunan ikon sosial (dari Link Management dokumen 08, filter kategori "sosial media") dalam grid ringkas, terpisah dari daftar link utama, untuk profil yang ingin memisahkan "link utama" vs "kehadiran sosial".

---

## 6. Gallery & Custom Effects

- Gallery widget (dokumen 09) dengan lightbox ringan (tanpa library berat tambahan bila memungkinkan — custom modal memakai `shared/components/ui/Modal`).
- **Custom Cursor** & **Particle Effects** — opsional, di-load dinamis (`dynamic import`) hanya jika diaktifkan user di Theme Builder, agar pengunjung yang profilnya tidak memakai fitur ini tidak menanggung bundle tambahan (code splitting per fitur, dokumen 02 §6).
- **Scroll Animation** — reveal-on-scroll untuk section (menggunakan `IntersectionObserver`, bukan library scroll-jacking berat) agar tetap ringan.

---

## 7. Profile Loading Animation

- Skeleton/loading state khusus halaman publik (bukan skeleton dashboard generik) — bentuk menyerupai layout profil final (avatar bulat, garis nama, blok link) sesuai aturan skeleton dokumen 01 §10.
- Durasi maksimum loading state sengaja dijaga pendek lewat strategi Suspense (§1) — loading animation bukan alasan untuk menunda data yang sebenarnya bisa tampil cepat.

---

## 8. SEO & Metadata

- `generateMetadata` per halaman `[username]` — title, description dari bio, `og:image` dinamis lewat `app/og/route.tsx` existing (avatar + nama + badge utama dirender ke gambar OG).
- Twitter Card `summary_large_image` memakai OG image yang sama.
- `robots.ts`/`sitemap.ts` (existing) diperluas otomatis memasukkan semua username publik yang `profileVisibility=PUBLIC` (existing enum), mengecualikan yang `PRIVATE`/`UNLISTED`.

---

## 9. Privacy Controls di Level Publik

- `ProfileVisibility` enum (existing: PUBLIC dkk) tetap jadi gate utama.
- Widget individual (Discord presence, dsb.) punya toggle privasi terpisah (dokumen 09 §5) — visibility profil dan visibility widget adalah dua lapis kontrol independen, bukan satu saklar besar saja.

---

## 10. Performa Halaman Publik (ringkasan — detail dokumen 16)

- Target Lighthouse ≥95 di halaman publik adalah metrik paling kritis karena ini halaman yang paling sering diakses publik (dibagikan ke banyak orang).
- Semua fitur "flashy" (video bg, particle, custom cursor) tunduk pada guard performa §6 — keindahan tidak boleh mengorbankan CLS/LCP.

---

**Selanjutnya:** Dokumen **12 — Premium System** (Plans, Billing, Stripe/QRIS, Subscription, Credits, Coupons).
