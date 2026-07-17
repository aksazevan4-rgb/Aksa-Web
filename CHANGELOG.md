# Changelog — Sesi Perbaikan Homepage, Auth, Theme & Dashboard

Ringkasan semua perubahan dari sesi ini, plus langkah yang HARUS kamu
jalankan sendiri secara lokal sebelum deploy.

## ⚠️ Langkah Wajib Sebelum Pakai

Sandbox yang dipakai untuk mengerjakan ini tidak punya akses ke
`binaries.prisma.sh`, jadi Prisma Client tidak bisa di-generate di sini.
Setelah menarik file ini ke project lokal kamu, jalankan:

```bash
npm install
npx prisma generate
npx prisma db push   # sinkronkan kolom/tabel baru ke database
```

Tanpa langkah ini, akan muncul beberapa error TypeScript soal
`@prisma/client` tidak punya `Role`, dll — itu BUKAN bug, cuma karena
Prisma Client belum digenerate.

---

## 1. Homepage — Navbar

**File:** `components/Navbar.tsx`, `app/page.tsx`

- Icon gear/settings dihapus total dari homepage.
- Saat belum login: tombol "Masuk" tetap muncul seperti biasa.
- Saat sudah login: tombol "Masuk" otomatis berubah jadi avatar + nama +
  dropdown (Dashboard, Profile, Settings, Logout). Berlaku di desktop dan
  mobile menu.
- `app/page.tsx` sekarang mengambil session di server dan mengirim ke
  Navbar sebagai prop.

## 2. Session — Auto Login Persisten

**File:** `lib/auth.ts`

- Strategi tetap JWT (sudah dari awal), tapi sekarang `maxAge` 30 hari
  diset eksplisit + `updateAge` 24 jam, jadi user TIDAK perlu login ulang
  setelah tutup browser / refresh, selama belum lewat 30 hari tanpa
  aktivitas.
- Konfigurasi cookie (httpOnly, secure di production, sameSite lax) diset
  eksplisit supaya tidak diam-diam berubah saat upgrade Auth.js.

## 3. Global Theme System

**File baru:** `components/ThemeProvider.tsx`, `components/ThemeSwitcher.tsx`
**File diubah:** `app/globals.css`, `app/layout.tsx`

- Light / Dark / System mode — bisa diganti kapan saja, langsung berubah
  tanpa reload.
- 8 preset warna aksen (Purple, Blue, Cyan, Green, Yellow, Orange, Red,
  Pink) + custom HEX color.
- **Per-visitor**, bukan per-akun: preferensi disimpan di
  localStorage + cookie browser, BUKAN di database. Siapapun (login atau
  tidak) bisa ganti tema sendiri.
- Semua komponen (navbar, button, card, dll) otomatis ikut berubah warna
  karena warna `purple`/`blue` di Tailwind sekarang dibaca dari CSS
  variable yang diubah ThemeProvider — bukan diganti satu-satu di setiap
  komponen.
- Ada script anti-flash di `<head>` supaya tidak ada kedipan warna salah
  sebelum React selesai mount.
- Picker tema ada di dua tempat: tombol palet di navbar (untuk visitor
  publik) dan panel lengkap di Dashboard > Settings.

## 4. Dashboard — Profile Settings

**File baru:** `app/dashboard/profile/actions.ts`, `app/dashboard/profile/ProfileForm.tsx`
**File diubah:** `app/dashboard/profile/page.tsx`, `prisma/schema.prisma`

- User bisa ubah: Display Name, Username, Bio, Avatar (URL), Banner (URL),
  Link sosial media (GitHub, Discord, X/Twitter, Instagram, YouTube,
  Website).
- Email TETAP read-only, tidak bisa diubah lewat form ini.
- Username divalidasi (3-24 karakter, huruf/angka/underscore, tidak boleh
  pakai nama yang sudah dipakai sistem seperti "admin", "dashboard", dst).

**⚠️ Catatan soal Avatar/Banner:** project ini belum punya storage
provider (S3, Vercel Blob, Cloudinary, dll), jadi untuk sekarang
avatar/banner diisi lewat **URL gambar** (paste link), bukan upload file
langsung. Kalau mau upload file asli, perlu pilih & pasang storage
provider dulu — itu keputusan yang sebaiknya kamu ambil sendiri
(tergantung budget & platform hosting).

**Perubahan schema:** kolom baru di tabel `User`: `username`, `bio`,
`bannerImage`, `socialLinks` (JSON).

## 5. Dashboard — Password Management

**File baru:** `app/dashboard/settings/actions.ts`, `app/dashboard/settings/PasswordChangeForm.tsx`

- Flow: Current Password → New Password → Confirm → Save.
- Untuk user yang login lewat GitHub OAuth (belum punya password sama
  sekali): form otomatis berubah jadi "Buat Password" tanpa minta current
  password, supaya mereka juga bisa login lewat email/password setelahnya.
- Rate limited (sama seperti login, 5x percobaan per 15 menit).

## 6. Dashboard — Security Section

**File baru:** `app/dashboard/settings/SecurityPanel.tsx`

- **Active Sessions** — daftar device yang masih login, dengan info
  browser/OS, IP, dan kapan terakhir aktif.
- **Logout All Devices** — revoke semua sesi aktif sekaligus.
- **Last Login & Last IP** — ditampilkan di bagian atas.
- **Login History** — 10 percobaan login terakhir (metode, IP, waktu).

**Perubahan schema:** dua tabel baru, `LoginEvent` (riwayat login) dan
`ActiveToken` (sesi aktif). Diperlukan karena project ini pakai strategi
JWT stateless — tanpa dua tabel ini, fitur "logout all devices" tidak
mungkin diimplementasikan (token JWT normal tidak bisa di-revoke begitu
sudah diterbitkan).

**Trade-off yang perlu kamu tahu:** setiap load halaman dashboard sekarang
melakukan 1 query database tambahan (cek status revoked token). Untuk
trafik dashboard personal, ini tidak masalah — tapi kalau nanti trafiknya
jadi besar, ini titik yang mungkin perlu dioptimasi (cache, dll).

---

## Bug Lama yang Ikut Diperbaiki (bukan dari instruksi awal, tapi ditemukan saat mengerjakan)

1. **`app/dashboard/page.tsx` infinite redirect untuk role USER** — halaman
   ini sebelumnya pakai `verifyAdmin()`, yang redirect ke `/dashboard`
   kalau bukan ADMIN. Karena halaman itu SENDIRI adalah `/dashboard`, user
   biasa (role USER) akan looping. Sudah diganti ke `verifySession()` +
   konten admin ditampilkan kondisional.
2. **`next.config.ts` tidak punya `images.remotePatterns`** — artinya
   avatar dari GitHub OAuth (`avatars.githubusercontent.com`) sebenarnya
   akan ERROR saat dirender lewat `next/image`, bukan cuma tidak optimal.
   Sudah ditambahkan, plus wildcard HTTPS untuk avatar/banner URL custom
   yang user paste sendiri.
   ⚠️ Wildcard `hostname: "**"` ini pragmatis untuk sekarang (karena belum
   ada upload file), tapi artinya server akan fetch & proxy URL apapun
   yang user masukkan. Sebaiknya dipersempit lagi setelah ada sistem
   upload/storage yang jelas.

---

## Yang SENGAJA Tidak Dikerjakan (sesuai instruksi)

- Google Authentication & Apple Authentication — tetap nonaktif/hidden.
- Drag & drop profile builder, widget marketplace, template marketplace,
  multi-tenant public profile, admin panel lengkap, dll dari dokumen
  spesifikasi awal — itu semua bagian dari produk berbeda (SaaS
  multi-tenant ala Linktree), bukan project portfolio single-admin ini.
  Sudah didiskusikan di awal sesi dan diputuskan untuk fokus ke project
  yang ada saja.
- 2FA dan "Hapus Akun" di halaman Settings — masih placeholder "Soon",
  karena tidak termasuk di permintaan eksplisit sesi ini.
