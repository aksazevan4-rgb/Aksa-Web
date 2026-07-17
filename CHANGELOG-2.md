# Changelog #2 — CMS Lengkap, Migrasi Database, Cloudinary Upload

Lanjutan dari `CHANGELOG.md` (sesi sebelumnya). Sesi ini menyelesaikan
SEMUA fitur yang masih "Soon"/placeholder, termasuk migrasi besar
homepage dari data statis (`lib/data.ts`) ke database (Prisma).

## ⚠️ Langkah Wajib Sebelum Pakai

1. **Generate Prisma Client & sync schema** (ada model baru: `LoginEvent`,
   `ActiveToken`, field baru di `User`/`Settings`):
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

2. **Isi data awal supaya homepage tidak kosong**:
   ```bash
   npm run seed
   ```
   Seed sudah diperluas mencakup Services dan Testimonials (sebelumnya
   cuma Profile/Ecosystem/Projects/TechStack/Stats/Focus/Settings).

3. **Daftar Cloudinary (gratis) dan isi 3 kredensial di `.env`**:
   - Daftar di https://cloudinary.com/users/register/free
   - Setelah login, di Dashboard utama akan terlihat `Cloud Name`,
     `API Key`, `API Secret` — isi ke:
     ```
     CLOUDINARY_CLOUD_NAME="..."
     CLOUDINARY_API_KEY="..."
     CLOUDINARY_API_SECRET="..."
     ```
   - Tanpa ini, fitur upload file (avatar/banner/gallery/media manager)
     tidak akan berfungsi — tapi opsi "paste URL" tetap jalan tanpa
     Cloudinary sama sekali.

---

## PERUBAHAN BESAR: Homepage Sekarang Database-Driven

Sebelumnya homepage membaca dari `lib/data.ts` (file statis hardcoded).
Sekarang SEMUA section membaca langsung dari database lewat Prisma,
supaya CMS yang dibangun di sesi ini benar-benar berefek ke homepage:

- `Hero.tsx`, `About.tsx`, `Ecosystem.tsx`, `Projects.tsx`,
  `TechStack.tsx`, `Connect.tsx` — semua dipecah jadi pasangan Server
  Component (fetch data) + Client Component `*View.tsx` (animasi/render).
- `lib/data.ts` masih ada dan TIDAK dihapus — masih dipakai oleh
  `Stats.tsx` dan `Focus.tsx` yang SENGAJA tidak dimigrasikan (lihat
  bagian "Yang Sengaja Tidak Dikerjakan" di bawah).
- `app/layout.tsx`: metadata SEO sekarang dinamis (`generateMetadata()`),
  dibaca dari tabel `Settings`, bukan hardcoded lagi.

---

## 8 CMS Lengkap (Dashboard > Konten Website)

Semua section di `/dashboard/admin/content` yang sebelumnya bertuliskan
"Soon" sekarang fully functional:

1. **Edit Profil About Me** — nama, role, daftar role (animasi Hero),
   founder of, lokasi, timezone, status, bio, avatar.
2. **Kelola Projects** — CRUD lengkap, drag-to-reorder, toggle
   tampil/sembunyi, upload thumbnail & banner, slug auto-generate.
3. **Kelola Ecosystem Nodes** — CRUD + reorder, muncul di status strip
   Hero DAN section Ecosystem penuh.
4. **Kelola Tech Stack** — CRUD + reorder, level skill (Beginner/
   Intermediate/Advanced) sekarang divisualisasikan penuh (sebelumnya
   cuma 2 state efektif, sekarang 3).
5. **Kelola Testimonials** — CRUD + workflow status (Pending/Approved/
   Rejected). **Section publik BARU**: carousel testimoni di homepage
   (sebelumnya tidak ada sama sekali, walau modelnya sudah ada di schema).
6. **Kelola Services** — CRUD + reorder. **Section publik BARU**: grid
   layanan di homepage (sebelumnya juga tidak ada UI publiknya).
7. **Pengaturan SEO** — site title/description/OG image + SEMUA link
   sosial media (GitHub, Discord personal, Discord AKSA.ID, Website,
   YouTube, TikTok, Instagram, Saweria, BagiBagi). 5 field social baru
   ditambahkan ke model `Settings` supaya `Connect.tsx` bisa sepenuhnya
   diatur dari sini.
8. **Media Manager** — grid semua file yang pernah diupload, search,
   upload langsung, hapus (dengan pengecekan dulu apakah file masih
   dipakai di avatar/banner/thumbnail/gallery sebelum boleh dihapus).

Setiap aksi CRUD di atas otomatis tercatat di **Activity Log**
(`AuditLog`) — konsisten dengan pola yang sudah ada sebelumnya untuk
manajemen user.

---

## Upload File Asli (Cloudinary)

Sesuai permintaan: avatar/banner/gallery sekarang bisa diisi 2 cara —
**paste URL** ATAU **upload file asli dari device** (file manager,
galeri foto, kamera — ketiganya muncul otomatis lewat native picker
browser, tidak perlu 3 tombol terpisah).

- `lib/cloudinary.ts` — upload/delete helper, validasi tipe file (JPG/
  PNG/WEBP/GIF) dan ukuran maksimal 8MB, auto-resize gambar besar
  (misal dari kamera HP) supaya tidak membebani kuota gratis.
- `components/admin/MediaUploadField.tsx` — komponen reusable dipakai di
  semua form CMS yang butuh gambar (Profile, Projects, SEO OG Image).
- Setiap file yang diupload otomatis tercatat di tabel `Media` dan
  muncul di Media Manager — bukan cuma tersimpan sebagai URL lepas.

**Kenapa Cloudinary, bukan Vercel Blob/S3?** Karena project ini rencana
deploy-nya bisa di Vercel ATAU VPS sendiri nanti — Cloudinary tidak
terikat ke satu platform hosting, beda dengan Vercel Blob yang cuma
masuk akal kalau selamanya di Vercel.

---

## Perbaikan Lain

- **Notification bell di Topbar** (sebelumnya disabled/"Soon") — sekarang
  menampilkan jumlah pesan contact form yang belum dibaca (UNREAD),
  dengan polling ringan setiap 60 detik. Hanya muncul untuk role ADMIN.
- **Sidebar "Integrasi" (Discord/YouTube/GitHub)** — sebelumnya disabled
  permanen termasuk "Spotify" (yang tidak punya data sumber). Sekarang
  jadi link aktif ke URL yang diatur di Pengaturan SEO, dan disembunyikan
  total kalau belum ada satupun yang diisi. Spotify dihapus karena tidak
  ada field datanya di mana pun — menambahkannya tanpa data nyata berarti
  cuma pindah dari "disabled" ke "link kosong", bukan perbaikan.
- **Messages (pesan contact form)** — sekarang punya aksi: tandai
  dibaca/dibalas/arsip, balas lewat email (mailto), hapus (dengan
  konfirmasi klik dua kali).
- **Hapus Akun** (Dashboard > Settings) — sebelumnya "Soon". Sekarang
  fully functional dengan pengamanan: user dengan password wajib
  konfirmasi password; user OAuth-only wajib mengetik ulang teks
  konfirmasi; ADMIN tidak bisa menghapus dirinya sendiri kalau itu
  satu-satunya admin yang aktif (mencegah sistem tanpa admin sama sekali).
- **Admin Dashboard "More Soon" tile** — diganti jadi link aktif ke
  Media Manager, melengkapi 4 quick-action.

---

## Yang Sengaja TIDAK Dikerjakan

- **`Stats.tsx` dan `Focus.tsx`** masih membaca dari `lib/data.ts`
  (statis), TIDAK dimigrasikan ke database. Alasannya: dua section ini
  tidak termasuk dalam 8 CMS yang diminta secara eksplisit, dan
  memigrasikannya berarti scope creep tanpa permintaan jelas. Kalau
  nanti ingin diedit lewat dashboard juga, model `Stat` dan `FocusItem`
  sudah ada di schema — tinggal dibuatkan CMS-nya seperti 8 yang lain.
- **`Achievement` dan `ExperienceEntry`** — dua model ini ada di schema
  sejak awal tapi TIDAK PERNAH punya tampilan publik maupun CMS, di sesi
  manapun. Dibiarkan sebagaimana adanya karena tidak ada section
  homepage yang memakainya dan tidak diminta secara eksplisit.
- **`Sidebar.tsx`'s `SidebarContent` function** — ESLint menandai ini
  "component dibuat saat render" (pre-existing dari sesi sebelumnya,
  bukan kode baru sesi ini). Tidak diperbaiki karena perbaikannya butuh
  restrukturisasi closure yang cukup besar untuk file yang sudah
  kompleks, berisiko regresi tanpa permintaan eksplisit untuk itu.

## Catatan Desain

- **"Device ini" di Active Sessions** (dari sesi sebelumnya) masih
  pakai heuristik "token paling baru dipakai" — tidak berubah di sesi
  ini.
- **Avatar/banner/OG image masih bisa diisi URL eksternal apapun**
  (`next.config.ts`'s `hostname: "**"` wildcard) selain upload Cloudinary
  — ini sengaja dipertahankan supaya opsi "paste URL" yang diminta tetap
  jalan. Server akan fetch & optimize URL apapun yang dipaste; pertimbangkan
  mempersempit ini nanti kalau upload sudah jadi cara utama.
