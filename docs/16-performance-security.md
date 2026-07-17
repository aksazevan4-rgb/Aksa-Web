# 16 — Performance & Security
## AKSA AboutMe

---

## 1. Target Metrik (Definition of Done Performa)

| Metrik | Target |
|---|---|
| Lighthouse Performance (halaman publik) | ≥ 95 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| TTFB (dashboard, dengan cache Redis) | < 400ms |

Target ini diuji otomatis di CI (dokumen 17), bukan hanya dicek manual sesekali.

---

## 2. Strategi Caching (Ringkasan Lintas Dokumen)

- **Redis** — data mahal-hitung, sering-akses (dokumen 03 §3): profil publik, analytics summary, badge progress, rate limit counter.
- **Next.js Data Cache + `revalidateTag`** — data server-rendered yang berubah lewat Server Action tertentu, di-invalidate presisi per tag (bukan `revalidatePath` yang membersihkan seluruh cache lebih dari perlu).
- **CDN/Edge caching** untuk aset statis (gambar, font, OG image) — header cache-control panjang untuk aset immutable (hash di filename), pendek/none untuk data personal.

---

## 3. Image & Media Optimization

- Semua gambar lewat `next/image` (otomatis resize/format modern) + Cloudinary transformation (existing) untuk upload user (avatar, banner, gallery, background).
- Lazy loading default untuk gambar below-the-fold, `priority` eksplisit hanya untuk gambar LCP kandidat (avatar hero di atas fold).
- Video background (dokumen 11 §2) dikompresi otomatis saat upload, batas ukuran & durasi ditegakkan server-side.

---

## 4. Code Splitting & Bundle Discipline

- Modal/editor berat (Theme Builder detail, Widget Builder, QR generator, Font upload) — dynamic import, tidak masuk bundle awal dashboard (dokumen 02 §6).
- Analisis bundle (`next build` + bundle analyzer) dijalankan sebagai bagian CI untuk mendeteksi regresi ukuran bundle sebelum merge (dokumen 17).
- Library pihak ketiga besar (chart, animasi timeline) hanya diimpor di halaman yang membutuhkannya, tidak di root layout.

---

## 5. Streaming & React Server Components

- Server Components sebagai default (dokumen 02 §1) mengurangi JS yang dikirim ke client secara drastis dibanding pola client-heavy lama.
- Suspense boundary granular (dokumen 02 §8) memastikan konten inti tampil cepat meski ada bagian yang menunggu data eksternal (Discord/Spotify presence).

---

## 6. Mencegah CLS & Hydration Mismatch

- Skeleton loading menyerupai bentuk final konten (dokumen 01 §10) — mencegah lonjakan layout saat data asli masuk.
- Reserve space eksplisit (`min-height`/aspect-ratio) untuk elemen yang kontennya datang belakangan (gambar, widget eksternal).
- Data yang berbeda antara server-render dan client-render (mis. waktu lokal, status online) di-render dengan strategi aman: render placeholder netral di server, isi nilai dinamis setelah mount di client (`useEffect`) — bukan langsung merender nilai berbeda yang memicu hydration mismatch.

---

## 7. Security Hardening

| Area | Kontrol |
|---|---|
| Input | Validasi Zod di setiap Server Action & API route (dokumen 03 §7) |
| XSS | Sanitasi HTML/SVG kustom (`isomorphic-dompurify`, existing) untuk custom icon upload, custom HTML widget (di-sandbox iframe, dokumen 09) |
| CSRF | Server Actions Next.js punya proteksi bawaan (origin check); Route Handler tambahan diberi verifikasi origin/secret eksplisit untuk webhook |
| SQL Injection | Prisma ORM (parameterized query by default) — tidak ada raw query string interpolation manual |
| Rate limiting | Dokumen 03 §6, terutama endpoint auth & publik |
| Secrets | Semua kredensial pihak ketiga di environment variable server-side, tidak pernah di-bundle ke client |
| Session | httpOnly + secure + sameSite cookie (NextAuth default), 2FA opsional (dokumen 05) |
| File upload | Validasi MIME type server-side, batas ukuran, scanning dasar sebelum disimpan ke Cloudinary |

---

## 8. Accessibility (Ringkasan Lintas Dokumen)

- Kontras warna AA minimum (dokumen 01 §3.4), navigasi penuh via keyboard (dokumen 01 §13), fokus selalu terlihat.
- Semua ikon interaktif punya label aksesibel (`aria-label`) bila tidak disertai teks visual.
- Form (React Hook Form) selalu mengaitkan error message ke input via `aria-describedby`.

---

## 9. Monitoring Performa Berkelanjutan

- Real User Monitoring (Core Web Vitals dari pengguna asli, bukan hanya lab test) dikumpulkan lewat Next.js Web Vitals reporting, dikirim ke endpoint analytics internal untuk dipantau tren dari waktu ke waktu (dashboard admin, dokumen 14 §6).
- Alert otomatis jika metrik kunci (LCP, error rate) memburuk signifikan dibanding baseline.

---

**Selanjutnya:** Dokumen **17 — Testing & Deployment** (unit/integration/E2E test, CI/CD, monitoring produksi).
