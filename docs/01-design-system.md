# 01 — UI & UX Design System
## AKSA AboutMe

> Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk semua keputusan visual di seluruh produk. Setiap komponen di dokumen 02–14 harus merujuk ke token dan aturan di sini — tidak boleh ada nilai warna/spacing/radius yang di-hardcode di luar sistem ini.

---

## 1. Prinsip Desain

1. **Token-first** — tidak ada magic number. Semua warna, jarak, ukuran font, radius, shadow berasal dari design token (lihat §3–§7), diimplementasikan sebagai CSS variables + Tailwind theme extension.
2. **Dark-first, light-ready** — base palette dirancang untuk dark mode, lalu diturunkan sistematis (bukan manual) ke light mode lewat mapping token semantik.
3. **Density terkontrol** — tiga level density (compact / comfortable / spacious) dipakai konsisten lintas dashboard, dipilih pengguna di Accessibility Settings.
4. **Motion dengan tujuan** — durasi dan easing dibakukan (§8), dipakai untuk memperjelas hubungan sebab-akibat, bukan dekorasi acak.
5. **Aksesibilitas bukan tambahan akhir** — kontras minimum WCAG AA, focus ring selalu terlihat, semua interaksi bisa dijalankan via keyboard.

---

## 2. Identitas Visual (Karakter AKSA)

- Tidak menggunakan neon-purple/hijau khas platform referensi sebagai warna utama. AKSA memakai **aksen indigo-elektrik dengan pendamping amber hangat** sebagai signature duo warna — kombinasi yang jarang dipakai kompetitor sejenis, memberi kesan "premium tapi hangat" alih-alih "gamer neon".
- Bentuk dasar (radius, ikon, kartu) condong ke **soft-rounded geometris** (radius menengah 12–16px), bukan pill-shape penuh atau kotak tajam — supaya terasa berbeda dari kompetitor yang umumnya full-rounded atau full-sharp.
- Glassmorphism dipakai **selektif** (panel elevated, modal, command palette) — bukan diterapkan ke semua kartu, supaya efek tetap terasa premium, bukan berlebihan.

---

## 3. Color System

### 3.1 Struktur Token
Tiga lapis token, mengikuti pola standar design system profesional:

```
Primitive tokens   → Semantic tokens        → Component tokens
--color-indigo-500 → --color-accent-default → --button-primary-bg
```

### 3.2 Primitive Palette (contoh skala, 50–950)

| Nama | Peran |
|---|---|
| `neutral` (slate-tuned) | Background, border, teks — 11 langkah |
| `indigo` | Aksen utama (aksi primer, link aktif, fokus) |
| `amber` | Aksen sekunder (badge premium, highlight, peringatan positif) |
| `emerald` | Status sukses |
| `rose` | Status error/destruktif |
| `sky` | Status informasi |

### 3.3 Semantic Tokens (dipakai di komponen)

```
--bg-canvas          neutral-950 (dark) / neutral-50 (light)
--bg-surface         neutral-900 / white
--bg-surface-raised  neutral-850 / neutral-50
--bg-glass           rgba(surface, 0.6) + blur(20px)
--border-subtle      neutral-800 / neutral-200
--border-strong      neutral-700 / neutral-300
--text-primary       neutral-50 / neutral-900
--text-secondary     neutral-400 / neutral-600
--text-muted         neutral-500 / neutral-500
--accent-default     indigo-500
--accent-hover       indigo-400
--accent-subtle-bg   indigo-500 @ 12% opacity
--premium-accent     amber-400
--danger             rose-500
--success            emerald-500
--info               sky-500
```

### 3.4 Kontras & Aksesibilitas
- Rasio kontras teks-primary vs bg-canvas ≥ 7:1 (AAA di teks utama).
- Rasio kontras teks-secondary vs bg-canvas ≥ 4.5:1 (AA minimum).
- Warna tidak pernah jadi satu-satunya penanda status (selalu didampingi ikon/label).

---

## 4. Typography

### 4.1 Font Stack
Menggunakan font open-source yang sudah ada di project (`@fontsource/*`):

| Peran | Font | Fallback |
|---|---|---|
| Display/Heading | Space Grotesk | Sora, system-ui |
| Body/UI | Inter | Manrope, system-ui |
| Monospace (kode, UID, API key) | JetBrains Mono | ui-monospace |

Pengguna dapat mengganti font body & heading lewat Font Manager (lihat dokumen 07), tapi default di atas adalah baseline sistem.

### 4.2 Type Scale (rasio 1.25 — Major Third)

| Token | Ukuran | Line-height | Pemakaian |
|---|---|---|---|
| `text-xs` | 12px | 16px | Caption, badge label |
| `text-sm` | 14px | 20px | Body kecil, helper text |
| `text-base` | 16px | 24px | Body default |
| `text-lg` | 18px | 28px | Sub-heading kecil |
| `text-xl` | 20px | 28px | Card title |
| `text-2xl` | 25px | 32px | Section heading |
| `text-3xl` | 31px | 38px | Page title |
| `text-4xl` | 39px | 46px | Hero/landing |

### 4.3 Font Weight
- 400 (regular) — body teks.
- 500 (medium) — label, button, nav item.
- 600 (semibold) — heading level 3–4, card title.
- 700 (bold) — heading level 1–2, angka statistik besar.

---

## 5. Spacing System

Skala berbasis 4px sebagai unit dasar (bukan campuran bebas):

```
space-1  = 4px     space-6  = 24px
space-2  = 8px     space-8  = 32px
space-3  = 12px    space-10 = 40px
space-4  = 16px    space-12 = 48px
space-5  = 20px    space-16 = 64px
```

**Aturan wajib:**
- Padding internal card: `space-4` (compact) / `space-6` (comfortable) / `space-8` (spacious).
- Gap antar elemen dalam grup form: `space-3`.
- Gap antar section dashboard: `space-8` minimum.
- Tidak ada nilai spacing custom di luar skala ini kecuali kasus grid pecahan (dibahas per-komponen di dokumen 06).

---

## 6. Elevation, Radius & Border

### 6.1 Radius Scale
```
radius-sm  = 8px   → input, chip kecil
radius-md  = 12px  → button, card kecil
radius-lg  = 16px  → card utama, modal
radius-xl  = 24px  → panel besar, hero section
radius-full = 9999px → avatar, pill status (dipakai terbatas, bukan default)
```

### 6.2 Shadow / Elevation

| Level | Pemakaian | Nilai (contoh dark mode) |
|---|---|---|
| `elevation-0` | Flat, menyatu dengan canvas | none |
| `elevation-1` | Card default | `0 1px 2px rgba(0,0,0,.24)` |
| `elevation-2` | Card hover, dropdown | `0 4px 12px rgba(0,0,0,.32)` |
| `elevation-3` | Modal, command palette | `0 12px 32px rgba(0,0,0,.4)` |
| `glow-accent` | Elemen aktif/fokus premium | `0 0 24px rgba(indigo-500,.35)` |

### 6.3 Glassmorphism (terkontrol)
Dipakai hanya untuk: Command Palette, Modal, Sidebar (opsional per tema), Widget Preview overlay.
```
background: var(--bg-glass);
backdrop-filter: blur(20px) saturate(160%);
border: 1px solid var(--border-subtle);
```
Tidak dipakai di: link card list, tabel data, form panel biasa — supaya keterbacaan tetap tinggi dan performa render tidak terbebani blur di banyak elemen sekaligus.

---

## 7. Iconography

- Base icon set: **Lucide** (sudah ada di dependency project), dipakai konsisten untuk seluruh UI chrome (nav, button, status).
- Icon sosial (Discord, GitHub, Spotify, dst.) memakai **brand icon set custom milik AKSA** (`BrandIcons.tsx` yang sudah ada), digambar ulang secara orisinal — bukan aset resmi brand pihak ketiga yang di-scrape.
- Ukuran ikon standar: 16px (inline teks), 20px (default UI), 24px (nav sidebar), 32px+ (empty state/illustration).
- Stroke width konsisten 1.75px di seluruh ikon UI chrome.

---

## 8. Motion Guidelines

### 8.1 Durasi Baku
```
duration-instant = 100ms   → hover state, toggle
duration-fast    = 150ms   → button press, tooltip
duration-normal  = 250ms   → panel expand, modal open
duration-slow    = 400ms   → page transition, badge unlock
```

### 8.2 Easing Baku
```
ease-standard = cubic-bezier(0.2, 0, 0, 1)     → default semua transisi
ease-emphasis = cubic-bezier(0.34, 1.2, 0.64, 1) → unlock badge, celebratory moment
```

### 8.3 Aturan
- Tidak ada animasi yang mengubah layout tanpa `transform`/`opacity` (mencegah CLS — lihat dokumen 16).
- Setiap animasi punya `prefers-reduced-motion` fallback (langsung ke end-state tanpa transisi).
- Micro-interaction (hover, press) selalu ≤150ms agar terasa responsif, bukan lambat.

---

## 9. Component Rules (ringkas — detail penuh di dokumen 02)

| Komponen | Aturan Kunci |
|---|---|
| **Button** | 3 varian (primary, secondary, ghost) × 3 ukuran (sm/md/lg). Primary selalu pakai `accent-default`, tidak pernah lebih dari satu primary button per section. |
| **Input** | Border `border-subtle` default, `accent-default` saat fokus + ring 2px. Selalu ada label + helper text slot, bahkan jika kosong (reserve space, cegah CLS). |
| **Dropdown/Select** | Memakai popover dengan `elevation-2`, radius `radius-md`, max-height dengan scroll internal (bukan overflow ke luar viewport). |
| **Modal** | `elevation-3` + glass, selalu punya close button + Escape key + click-outside-to-close (kecuali destructive confirm). |
| **Card** | Radius `radius-lg`, padding sesuai density setting, border `border-subtle`, hover → `elevation-2` transisi `duration-fast`. |
| **Toast** | Muncul dari bawah-kanan (desktop) / atas (mobile), auto-dismiss 4s kecuali error (manual dismiss), max 3 stack. |
| **Skeleton** | Bentuk skeleton harus meniru bentuk akhir konten (bukan kotak generik), mencegah layout shift saat konten asli masuk. |

---

## 10. State Design (Wajib untuk Semua Halaman)

Setiap halaman/komponen data-driven wajib mendefinisikan 5 state ini secara eksplisit (bukan default browser):

1. **Loading** — skeleton yang menyerupai bentuk final konten.
2. **Empty** — ilustrasi/ikon kecil + copy yang jelas + CTA aksi berikutnya.
3. **Error** — pesan spesifik (bukan "Something went wrong" generik) + tombol retry.
4. **Populated (default)** — state normal.
5. **Populated + interaksi (hover/active/focus)** — didefinisikan per komponen di §9.

---

## 11. Responsive & Breakpoints

```
sm  = 640px   → mobile besar
md  = 768px   → tablet potret
lg  = 1024px  → tablet lanskap / laptop kecil
xl  = 1280px  → desktop standar
2xl = 1536px  → desktop besar
ultrawide = 1920px+ → grid dibatasi max-width container (tidak stretch penuh, cegah "ultrawide kosong")
```

**Aturan container:** semua halaman dashboard punya `max-width: 1440px` dengan auto-margin di layar ultrawide, agar tidak ada ruang kosong berlebihan (poin dari keluhan "ultrawide layout terlalu kosong" pada audit awal).

---

## 12. Dark & Light Theme Mapping

Kedua tema memakai **primitive token yang sama**, hanya beda mapping semantic → primitive (lihat §3.3). Tidak ada komponen yang mendefinisikan warna eksplisit dark/light sendiri — semua lewat semantic token, sehingga theming otomatis konsisten di seluruh produk (termasuk tema custom buatan pengguna di dokumen 07).

---

## 13. Keyboard & Command Palette Standards

- Shortcut global: `Ctrl/Cmd + K` membuka Command Palette dari mana saja di dashboard.
- Navigasi command palette: panah atas/bawah, `Enter` untuk pilih, `Esc` untuk tutup.
- Setiap item navigasi sidebar wajib dapat diakses via command palette dengan alias pencarian (mis. "links" juga match untuk "Link Management").
- Focus ring (`outline: 2px solid var(--accent-default)`) tidak pernah dihilangkan (`outline: none` dilarang tanpa pengganti visual setara).

---

## 14. Checklist Kepatuhan Desain (dipakai saat review tiap komponen baru)

- [ ] Semua warna dari semantic token, tidak ada hex hardcoded.
- [ ] Semua spacing dari skala §5.
- [ ] Radius & shadow dari skala §6.
- [ ] 5 state (§10) didefinisikan.
- [ ] Kontras teks lolos AA minimum.
- [ ] Bisa dioperasikan penuh via keyboard.
- [ ] Motion memakai token durasi/easing §8, ada reduced-motion fallback.
- [ ] Responsive diuji di sm/md/lg/xl/2xl/ultrawide.

---

**Selanjutnya:** Dokumen **02 — Frontend Architecture** (struktur folder, App Router, state management, code splitting).
