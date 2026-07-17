# 07 — Profile Customization
## AKSA AboutMe

> Modul paling luas dari sisi kustomisasi. Basis existing: `AppearanceClient.tsx`, `BackgroundPicker.tsx`, `BorderPicker.tsx`, `FontPicker.tsx`, `LayoutPicker.tsx`, `WidgetManager.tsx`, field `profileTheme/profileLayout/profileBackground/profileBorder/profileFont/profileAccentColor` (model User). Dokumen ini menaikkan halaman Appearance jadi **Theme Builder** penuh sesuai spek.

---

## 1. Theme Builder — Struktur Panel

Bukan daftar toggle linear, melainkan layout multi-panel:

```
┌─────────────┬─────────────────────┬───────────────┐
│ Panel Kiri  │   Live Preview      │  Panel Kanan  │
│ (kategori)  │ (iframe/render      │  (kontrol     │
│             │  profil real-time)  │   detail)     │
└─────────────┴─────────────────────┴───────────────┘
```

**Kategori panel kiri:** Theme Presets, Color Palette, Typography, Card Style, Border, Shadow, Glow, Blur, Animation, Cursor, Widgets, Layout, Background, Decoration.

Klik kategori → panel kanan menampilkan kontrol spesifik → **Live Preview update instan** tanpa refresh (state draft di React Context, di-render ulang lewat props ke komponen public-profile yang sama persis dipakai di produksi — supaya preview akurat, bukan versi tiruan preview).

---

## 2. Live Preview — Implementasi

- Preview memakai **komponen public profile asli** (`app/[username]/page.tsx` view components) dirender dalam mode "draft" dengan data dari `AppearanceDraftContext`, bukan komponen preview terpisah yang bisa drift dari tampilan asli.
- Update state draft di-debounce 150ms (token `duration-fast`, dokumen 01) sebelum re-render preview, agar tetap smooth saat user menggeser slider warna cepat-cepat.
- Toggle "Preview sebagai: Desktop / Mobile" di atas panel preview.

---

## 3. Autosave, Draft, Publish

- Perubahan di Theme Builder disimpan sebagai **draft** (tabel/field terpisah dari data live profil) secara otomatis tiap beberapa detik (debounced), ditandai indikator kecil "Tersimpan sebagai draft" — bukan langsung menimpa profil publik.
- Tombol **Publish Changes** eksplisit memindahkan draft → live (field `profileTheme` dkk di model User, atau referensi ke `ThemeVersion` terbaru).
- **Version History** — setiap publish menyimpan snapshot (`ThemeVersion` — dokumen 04 §6), user bisa lihat riwayat dan **rollback** ke versi sebelumnya kapan saja.
- **Undo/Redo** di level draft (dalam sesi editing berjalan, sebelum publish) — stack perubahan lokal di client, tidak perlu round-trip server tiap undo.

---

## 4. Layout Builder

- Drag & drop **section** halaman profil (Hero, Links, Widgets, Gallery, Testimonials, dst — mengikuti komponen existing seperti `Hero.tsx`, `Projects.tsx`, `Testimonials.tsx` yang sudah ada) untuk mengubah urutan tampil.
- Setiap section bisa disembunyikan (toggle visibility) tanpa dihapus datanya — pengguna bisa aktifkan lagi kapan saja.
- Preset layout (Classic, Card Grid, Minimal, Magazine) sebagai titik awal cepat, tetap bisa dikustomisasi lebih lanjut setelah dipilih (preset bukan kunci mati).

---

## 5. Font, Effect & Animation Manager

- **Font Manager** — perluasan `FontPicker.tsx` existing: pilih font heading & body terpisah, dari daftar `@fontsource` yang sudah jadi dependency + opsi upload font kustom (premium) via Media/Cloudinary (sudah terintegrasi di project).
- **Effect Manager** — kontrol shadow/glow/blur (token dokumen 01 §6) diterapkan ke level kartu/section, bukan cuma global.
- **Animation Timeline** — kontrol urutan & delay animasi masuk elemen (hero muncul dulu → links stagger masuk → widget terakhir), memakai token durasi/easing dokumen 01 §8, direpresentasikan sebagai timeline visual sederhana (bukan input angka mentah semua).

---

## 6. Background & Decoration

- Static image, gradient kustom (color stop editor visual), atau **video background** (untuk premium, dibatasi ukuran file & auto-compressed via Cloudinary pipeline existing).
- Particle effects & custom cursor (opsional, disable otomatis saat `prefers-reduced-motion` aktif — dokumen 01 §8.3).
- Semua efek dekoratif berat (particle, video bg) diberi guard performa: dimatikan otomatis di mobile data terbatas atau device low-end terdeteksi (feature detection sederhana), agar tidak melanggar aturan performa dokumen 16.

---

## 7. Theme Presets & Marketplace Integration

- Preset bawaan AKSA (dibuat tim, desain orisinal, bukan tiruan preset kompetitor) tersedia gratis sebagai starting point.
- **Import Theme** / **Export Theme** — format JSON portabel (skema tervalidasi Zod), bisa dibagikan antar pengguna secara manual atau lewat Marketplace (dokumen 13) sebagai `MarketplaceListing type=THEME`.
- Preset premium eksklusif hanya bisa diterapkan oleh user dengan plan sesuai (dicek di Server Action publish, bukan hanya disembunyikan di UI).

---

## 8. Widget Manager (ringkas — detail penuh di dokumen 09)

Panel "Widgets" di Theme Builder adalah pintu masuk cepat: aktifkan/nonaktifkan widget dan atur urutannya langsung dari sini, sementara konfigurasi mendalam tiap widget dibuka di Widget Builder terpisah (dokumen 09) agar panel Theme Builder tidak menjadi terlalu padat.

---

## 9. Validasi & Batas Wajar

- Ukuran & tipe file upload (background, font kustom) divalidasi server-side (bukan hanya client) — tipe MIME diperiksa ulang, bukan percaya ekstensi file saja.
- Batas jumlah widget/section aktif per plan (FREE vs PREMIUM) divalidasi di Server Action `publishTheme`, dengan pesan jelas + CTA upgrade jika terlampaui (bukan silent-fail).

---

**Selanjutnya:** Dokumen **08 — Link Management** (Icon Picker, Link Card lengkap, folder/kategori, bulk actions, scheduling & proteksi).
