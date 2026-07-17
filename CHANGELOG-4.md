# Changelog #4 — Avatar Bulat Otomatis, Redesain Upload, Fitur Baru

Lanjutan dari `CHANGELOG-3.md`.

## 1. Avatar Sekarang Otomatis Bulat (Server-Side, Permanen)

**Masalah:** avatar tampil tidak konsisten — bulat di satu tempat,
kotak di tempat lain (ditemukan di `AboutView.tsx`/homepage, masih pakai
`rounded-2xl`).

**Perbaikan:**

- `lib/cloudinary.ts` — upload avatar sekarang otomatis di-crop bulat
  PERMANEN saat upload (`crop: "thumb", gravity: "auto", radius: "max"`,
  format PNG transparan). Apapun bentuk foto asli (persegi, panjang,
  lonjong), hasil upload-nya SELALU PNG bulat. Ini dilakukan SEKALI di
  server saat upload, bukan trik CSS — jadi konsisten di mana pun
  avatar dipakai.
- Deteksi folder avatar otomatis (folder apa pun yang mengandung kata
  "avatar" langsung dapat treatment ini), supaya tidak perlu mengingat
  pasang flag setiap kali ada folder avatar baru.
- `components/AboutView.tsx` — fix `rounded-2xl` yang salah jadi
  `rounded-full`, ditambah ring effect supaya konsisten dengan Navbar/
  Topbar yang sudah benar dari awal.

⚠️ **Catatan:** ini cuma berlaku untuk upload BARU lewat sistem ini.
Avatar GitHub/Google OAuth tetap dibulatkan lewat CSS `rounded-full`
(sudah konsisten di semua tempat sejak dicek ulang sesi ini).

## 2. MediaUploadField Dirombak Total

Kamu bilang tampilan sebelumnya "tidak rapi sama sekali" — sekarang
dipecah jadi dua varian visual yang beda total:

- **`variant="avatar"`** — lingkaran kecil dengan tombol kamera overlay
  saat hover (pola avatar picker umum di media sosial), bukan area drop
  besar yang janggal untuk foto kecil.
- **`variant="banner"`** — tetap area lebar dengan drag & drop, tapi
  kontrol upload/hapus sekarang muncul sebagai overlay saat hover,
  bukan tombol permanen yang memenuhi layar.

Dipakai di: Profile Settings (avatar+banner pribadi), Edit About Me
(avatar homepage), Projects (thumbnail+banner), SEO (OG Image).

## 3. Bug Upload Foto Profil (dari sesi sebelumnya) — Diselesaikan

`uploadMedia` sebelumnya cuma bisa dipanggil ADMIN. Sekarang dipecah:
`uploadMedia` (admin, folder bebas tapi divalidasi whitelist) dan
`uploadUserMedia` (SEMUA user login, folder dikunci `user-avatars`/
`user-banners`).

## 4. Foto Profil Tersambung ke Homepage

- Avatar akun pribadi → `revalidatePath("/")` ditambahkan, jadi avatar
  di Navbar langsung berubah di semua halaman.
- Avatar pemilik situs (About Me) → sudah benar dari sesi sebelumnya.

## 5. Dashboard Home Page Dirombak

`app/dashboard/page.tsx` sebelumnya bikin `<main>` sendiri (nested di
dalam `<main>` milik layout — HTML tidak valid, bikin layout Sidebar
berantakan) dan masih ada badge teks usang "Panel konten & media
manager sedang dibangun" padahal sudah selesai dari sesi lalu. Sekarang:
ringkasan statistik real-time (project tampil, pesan belum dibaca,
testimoni pending — khusus admin) + quick links yang lebih kaya.

## 6. Fitur Baru: Project Gallery

Model `ProjectGalleryImage` sudah ada di schema sejak awal tapi belum
pernah dibangun. Sekarang:

- Admin bisa tambah beberapa foto galeri per project (di luar
  thumbnail/banner utama), drag untuk reorder, hapus.
- Homepage: thumbnail project SEKARANG TAMPIL (sebelumnya field-nya
  ada di database tapi tidak pernah di-fetch/ditampilkan — bug lama
  yang baru ditemukan), dengan badge jumlah galeri di pojok kalau ada.
  Klik membuka lightbox foto galeri dengan navigasi prev/next.

## 7. Fitur Baru: Stats CMS, Focus Items CMS, Experience Timeline

Tiga bagian terakhir yang masih pakai data statis/belum ada UI sama
sekali, sekarang lengkap:

- **Kelola Statistik** — CRUD angka pencapaian (Projects Shipped, dst)
  yang tampil di homepage, drag reorder.
- **Kelola Focus Items** — CRUD section "Sedang Dikerjakan" homepage.
- **Kelola Riwayat Pengalaman** (BARU, model `ExperienceEntry` belum
  pernah punya tampilan) — timeline karir/proyek dengan tanggal mulai/
  selesai, tampil sebagai timeline vertikal baru di homepage (di antara
  About dan Ecosystem).

`lib/data.ts` sekarang TIDAK dipakai lagi oleh komponen manapun —
seluruh homepage sudah 100% database-driven.

## Model yang TETAP Tidak Dikerjakan (Keputusan Sadar)

- **`Achievement`** — strukturnya identik dengan `Stat` (label, value,
  order, visible) kecuali tanpa `suffix`. Membangun CMS terpisah untuk
  ini akan jadi dua tempat berbeda untuk konsep yang sama dan
  membingungkan. Kalau nanti memang dibutuhkan beda fungsi dari `Stat`,
  beri tahu perbedaan use-case-nya.

## File Baru Sesi Ini

- `components/admin/FormSectionHeader.tsx`
- `app/dashboard/admin/content/stats/*` (actions, StatForm, StatsClient, page)
- `app/dashboard/admin/content/focus/*` (actions, FocusForm, FocusClient, page)
- `app/dashboard/admin/content/experience/*` (actions, ExperienceForm, ExperienceClient, page)
- `app/dashboard/admin/content/projects/GalleryManager.tsx`
- `components/StatsView.tsx`, `components/FocusView.tsx`, `components/ExperienceView.tsx`, `components/Experience.tsx`
