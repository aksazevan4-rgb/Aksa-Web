# Changelog #3 — Premium System, Profil Publik Per-User (ala Linktree), Admin User Management

Lanjutan dari `CHANGELOG.md` dan `CHANGELOG-2.md`. Sesi-sesi sebelumnya
sengaja TIDAK membangun profil publik multi-tenant karena waktu itu belum
diminta secara eksplisit ("itu produk berbeda — SaaS ala Linktree, bukan
project portfolio single-admin ini"). Sesi ini mengeksekusi permintaan baru
yang memang secara eksplisit minta fitur itu: sistem premium, profil publik
per-user dengan tombol custom ala Linktree, dan perluasan admin panel.

## Langkah Wajib Sebelum Pakai

Ada model baru (`ProfileLink`) dan field baru di `User` — wajib sync
schema dulu sebelum project bisa jalan:

```bash
npm install
npx prisma generate
npx prisma db push
```

Tidak ada migration history (`prisma/migrations`) di project ini, jadi
dipakai `db push` (schema-sync langsung), konsisten dengan workflow yang
sudah ada. Kalau lebih suka migration history bertahap, bisa pakai
`npx prisma migrate dev --name premium_and_profile_links` sebagai
gantinya — tinggal pilih salah satu.

Tidak ada env var baru. Semua fitur baru pakai kredensial yang sudah
ada (Cloudinary untuk upload, Auth.js untuk session).

Catatan penting soal sandbox pengerjaan: sandbox yang dipakai untuk
sesi ini tidak punya akses ke binaries.prisma.sh, jadi prisma generate
gagal di sini juga (sama seperti yang dicatat di CHANGELOG.md). Semua
kode sudah diverifikasi dengan cara lain (dijelaskan di bagian "Verifikasi
yang Sudah Dilakukan" di bawah), tapi belum pernah benar-benar berhasil
npm run build end-to-end dengan Prisma Client asli — itu baru bisa
dipastikan di komputer Anda begitu langkah di atas dijalankan.

---

## 1. Perbaikan Avatar (Bug Lama)

Sebelum sesi ini, avatar punya 2 masalah nyata:

- URL avatar yang error/host tidak dikenal bisa membuat halaman crash.
  `Navbar.tsx` merender `user.image` lewat `next/image` tanpa `unoptimized`
  — kalau user paste URL `http://` (bukan https), Next.js melempar error
  "hostname is not configured" saat render, bukan cuma tampil jelek.
- Upload file foto profil cuma ada untuk admin (lewat CMS Media
  Manager). User biasa di Profile Settings hanya bisa paste URL, tidak
  bisa upload dari device.

Perbaikan:

- `components/UserAvatar.tsx` (baru) — avatar yang dipakai konsisten
  di Navbar, Topbar, dashboard, admin panel, dan profil publik. Pakai
  `<img>` mentah + `onError` yang otomatis fallback ke avatar inisial
  huruf pertama nama/email kalau URL apapun gagal dimuat — tidak pernah
  melempar error React, apa pun isi URL-nya.
- `components/UserMediaUploadField.tsx` (baru) — versi
  `components/admin/MediaUploadField.tsx` untuk user biasa: tab "URL" vs
  "Upload", dipakai di Profile Settings untuk foto profil & banner.
- `lib/user-media-actions.ts` (baru) — `uploadOwnMedia()`, versi
  `uploadMedia()` (admin) yang bisa dipakai user biasa, dibatasi folder
  `avatars`/`banners` saja dan tetap kena rate limit per user (5x/15
  menit, reuse `lib/rate-limit.ts`) supaya tidak disalahgunakan sebagai
  image host gratis.
- `lib/validation.ts` — tambah `isSafeImageUrl()` (https-only, khusus
  avatar/banner) dan `isSafeLinkUrl()` (http/https/mailto/tel, untuk
  tombol custom link). `updateProfile()` di
  `app/dashboard/profile/actions.ts` sekarang pakai validator yang lebih
  ketat ini.

## 2. Sistem Premium

- Schema: `User.plan` (`FREE`/`PREMIUM`), `User.premiumSince`,
  `User.isFounder` (badge permanen untuk akun admin bootstrap pertama,
  TIDAK bisa diberikan lewat panel admin — cuma di-set otomatis sekali di
  `lib/auth.ts` saat email cocok `ADMIN_BOOTSTRAP_EMAIL`).
- `lib/premium.ts` (baru) — `hasPremiumAccess(user)` (true kalau
  admin ATAU plan premium) dan `getPlanLabel(user)` (Founder > Admin >
  Premium > User). Sengaja pakai string union biasa, bukan enum
  `Role`/`Plan` dari `@prisma/client`, supaya file ini aman diimpor dari
  Client Component tanpa menyeret runtime Prisma ke bundle browser.
- `components/PlanBadge.tsx` (baru) — badge warna beda per level,
  dipakai di Navbar, Topbar, dashboard, admin panel, profil publik.
- `components/PremiumGate.tsx` (baru) — komponen lock-overlay siap
  pakai untuk fitur premium-only ke depannya (blur + ikon gembok +
  pesan upgrade). Belum dipasang di fitur spesifik lain di luar limit
  link (lihat poin 3), disiapkan sebagai infrastruktur per permintaan
  "siapkan struktur premium dengan rapi".
- Satu premium gate yang benar-benar aktif: akun FREE dibatasi
  maksimal 5 tombol custom link, Premium/Admin tanpa batas
  (`FREE_LINK_LIMIT` di `lib/premium.ts`, ditegakkan di server di
  `app/dashboard/profile/links/actions.ts`, bukan cuma di UI).
- Admin bisa toggle plan user lewat panel admin (lihat poin 4).

## 3. Profil Publik Per-User + Tombol Custom (ala Linktree)

- `app/[username]/page.tsx` (baru) — halaman publik di
  aksa.id/username. Menampilkan banner, avatar, nama, badge plan, bio,
  ikon social link, dan tombol custom link bergaya Linktree. Visibilitas
  PUBLIC/PRIVATE dihormati (private hanya kelihatan oleh pemilik &
  admin). Increment `profileViews` otomatis tiap dikunjungi orang lain
  (bukan oleh pemiliknya sendiri, supaya statistik tidak digelembungkan
  oleh preview sendiri). Footer "Powered by AKSA.ID" muncul untuk akun
  FREE, hilang untuk Premium/Admin.
- Model `ProfileLink` (baru) — tombol custom per user: label, url,
  icon, order, visible, clicks. Dikelola di
  `app/dashboard/profile/links/` (baru): drag-to-reorder (pola sama
  seperti `EcosystemClient.tsx`/CMS admin — native HTML5 drag, bukan
  library baru), toggle tampil/sembunyi, edit, hapus (konfirmasi 2 klik).
- `app/l/[id]/route.ts` (baru) — semua tombol custom link mengarah ke
  sini dulu (bukan langsung ke URL tujuan), supaya klik tercatat di
  server (+1 clicks) sebelum redirect 302 — akurat walau JS dimatikan.
- `components/LinkIcon.tsx` (baru) — ikon untuk tombol (Instagram,
  TikTok, YouTube, WhatsApp, Discord, dst). Catatan teknis penting:
  versi lucide-react di project ini (1.21.x) sudah tidak punya ikon
  brand sama sekali (Instagram/Twitter/YouTube/Discord/dst semua
  undefined) — ini sudah ditangani sebelumnya di
  `components/ConnectView.tsx` dengan SVG buatan sendiri. `LinkIcon.tsx`
  mengikuti pola yang sama (SVG minimal sendiri, bukan impor dari
  ConnectView, supaya file itu tidak perlu diubah).
- Reserved username ditambah (l, links, premium, logout, dst)
  supaya tidak konflik dengan route sistem yang baru.
- Username tidak diminta saat registrasi — kalau belum diisi, profil
  publik belum aktif. Dashboard & Profile Settings mengarahkan user untuk
  mengisi username dulu dengan jelas (bukan error membingungkan).

## 4. Admin: Kelola Premium, Status Akun, Edit Profil User

`app/dashboard/admin/users/`:

- Toggle Premium per user (tombol Sparkles), ubah status akun
  (ACTIVE/SUSPENDED/BANNED, dropdown langsung di tabel — sebelumnya
  field ini ada di schema tapi tidak ada UI-nya sama sekali), dan
  edit profil user lain (nama/username/bio, modal baru
  `AdminEditUserModal.tsx`) — tiga hal ini eksplisit diminta dan
  sebelumnya belum ada.
- Akun Founder dilindungi: tidak bisa diturunkan rolenya, di-suspend/
  ban, atau dihapus — baik dari UI (tombol disabled) maupun di server
  (API menolak dengan pesan jelas kalau dicoba langsung). Supaya admin
  pertama/pemilik tidak bisa tidak sengaja mengunci diri sendiri keluar.
- Semua aksi admin (plan/status/edit) tercatat di audit log
  (`AuditAction` ditambah `PLAN_CHANGE` dan `STATUS_CHANGE`), konsisten
  dengan aksi role-change yang sudah ada sebelumnya.
- Perbaikan kecil sambil lewat: audit log ROLE_CHANGE sebelumnya
  mencatat previousRole dengan cara menebak (membalik role baru),
  bukan dari data asli — sekarang diambil dari nilai role SEBELUM update,
  jadi riwayatnya akurat.
- `app/dashboard/admin/page.tsx` — tambah kartu statistik "User Premium".

## 5. Dashboard User Lebih Lengkap

- `app/dashboard/page.tsx` dirombak: avatar + badge plan, statistik
  ringkas (Profile Views, Link Clicks, jumlah tombol link), quick actions
  (Profil Saya, Tombol Link, Lihat Profil Publik/Aktifkan kalau belum
  punya username, Pengaturan), shortcut admin (kalau admin), dan section
  "Segera Hadir" (Custom Domain, Analitik Lanjutan, Embed Widget) sebagai
  fitur "Soon" yang jujur — ditandai jelas belum dibangun, bukan
  berpura-pura ada.
- Menghapus notice lama "Panel konten & media manager sedang dibangun"
  di halaman ini — itu sudah tidak benar sejak CHANGELOG-2.md (CMS
  sudah lengkap), jadi dibiarkan akan menyesatkan user.
- `app/dashboard/profile/page.tsx` & `ProfileForm.tsx` dirombak:
  upload avatar/banner (URL atau file), toggle visibilitas
  publik/private, pilih tema profil publik (4 preset:
  `lib/profile-themes.ts`), kartu statistik, shortcut ke pengelola
  tombol link & preview profil publik.
- `components/dashboard/Sidebar.tsx` — tambah menu "Tombol Link".

## 6. Perbaikan Kecil Lain

- `components/Navbar.tsx` — dua tombol "Masuk" (desktop & mobile) pakai
  `<a href="/login...">` mentah, bukan `<Link>` dari `next/link` (ketauan
  dari ESLint `no-html-link-for-pages` saat audit). Diganti ke `<Link>`
  supaya navigasi ke halaman login full client-side, bukan reload penuh.

## Verifikasi yang Sudah Dilakukan

Karena sandbox tidak bisa connect ke binaries.prisma.sh (sama seperti
sesi sebelumnya), prisma generate asli tidak bisa jalan di sini. Supaya
tidak asal kirim kode tanpa pengecekan, dilakukan ini:

1. Dibuat shim TypeScript sementara (cuma di node_modules lokal
   sandbox, BUKAN bagian dari project yang dikirim) yang menirukan bentuk
   model & enum dari schema final, supaya `tsc --noEmit` punya sesuatu
   yang nyata untuk dicek alih-alih semuanya `any`.
2. `npx tsc --noEmit` — bersih, sisa 3 error adalah keterbatasan shim
   (bukan bug nyata): dua di antaranya soal field relasi yang ditandai
   "mungkin undefined" padahal sebenarnya pasti ada karena di-select
   eksplisit (shim sederhana ini tidak memodelkan penyempitan tipe
   berdasar select seperti Prisma asli), satu soal `_count` (sintaks
   resmi Prisma untuk hitung relasi, cuma tidak dimodelkan shim).
   Sudah dicek manual satu-satu, bukan bug.
3. `npx eslint .` — bersih, sisa 3 error semuanya pre-existing dari
   sesi sebelumnya (Sidebar.tsx sudah didokumentasikan di
   CHANGELOG-2.md; Stats.tsx soal `setState` di dalam `useEffect` belum
   pernah didokumentasikan sebelumnya tapi juga bukan kode baru sesi
   ini), tidak ada satupun yang baru dari sesi ini.
4. `npm run build` — berhasil sampai tahap bundling (Turbopack compile
   sukses), berhenti di tahap pengecekan tipe karena 3 keterbatasan shim
   di atas. Setelah keterbatasan shim itu dilewati sementara (cuma untuk
   tes, langsung dikembalikan), build lanjut sampai tahap pengumpulan
   data halaman, lalu berhenti dengan pesan
   "@prisma/client did not initialize yet" — ini murni karena tidak ada
   Prisma Client asli di sandbox, BUKAN error dari kode. Ini akan hilang
   begitu Anda jalankan npx prisma generate dengan akses internet normal
   di komputer Anda.

Singkatnya: kode sudah diverifikasi sejauh mungkin tanpa Prisma Client
asli. Build end-to-end yang sesungguhnya baru bisa dipastikan 100% di
komputer Anda setelah langkah "Langkah Wajib Sebelum Pakai" di atas.
Kalau ada error saat itu, kemungkinan besar di area yang memang tidak
bisa dicek di sini (mis. shape hasil query yang sangat spesifik) — beri
tahu pesan errornya untuk dibantu perbaiki lebih lanjut.

## Yang Sengaja TIDAK Dikerjakan

- Pembayaran/billing untuk upgrade Premium. Permintaan eksplisit cuma
  minta "struktur database dan validasi akses premium" — bukan
  integrasi payment gateway. Saat ini upgrade ke Premium cuma bisa lewat
  toggle admin. Kalau dibutuhkan payment flow (Midtrans/Stripe/dst), itu
  scope terpisah yang cukup besar (webhook, invoice, dst).
- Drag-and-drop reorder pakai library — tetap pakai native HTML5 drag
  (pola yang sudah ada), bukan menambah dependency baru.
- `Sidebar.tsx`'s `SidebarContent` function — isu pre-existing yang
  sudah dicatat di CHANGELOG-2.md, tetap tidak diperbaiki di sesi ini
  dengan alasan yang sama (restrukturisasi besar, risiko regresi, tidak
  diminta eksplisit).
- Tema profil publik tidak dibedakan Free vs Premium — keempatnya bisa
  dipakai semua plan. PremiumGate sudah siap kalau nanti ingin sebagian
  tema dikunci ke Premium.

## Catatan Desain

- Avatar/banner masih bisa diisi URL eksternal apapun (selain upload)
  — sama seperti yang sudah dicatat di CHANGELOG-2.md, sengaja
  dipertahankan supaya opsi "paste URL" yang diminta tetap jalan, dengan
  fallback aman lewat UserAvatar.
- Statistik profile view & link click sangat sederhana (counter
  polos, tidak ada dedup per-IP/per-hari, tidak ada grafik harian) —
  sesuai permintaan "statistik sederhana". Analitik lebih detail
  ditandai "Soon" di dashboard.
