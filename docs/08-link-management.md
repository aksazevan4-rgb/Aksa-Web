# 08 — Link Management
## AKSA AboutMe

> Basis existing: `ProfileLink` model, `ProfileLinksClient.tsx`, `ProfileLinkForm.tsx`, `LinkIcon.tsx`, `BrandIcons.tsx`. Dokumen ini merinci remake total ke editor profesional sesuai spek.

---

## 1. Social Icon Picker

- Modal/panel terpisah, dibuka dari tombol "Pilih Ikon" di Link Form.
- **Kategori** (mengelompokkan icon library `BrandIcons.tsx` yang diperluas): Sosial Media, Gaming/Platform, Musik, Chat/Komunikasi, Developer, Pembayaran/Kripto, Lainnya — mencakup semua yang disebut di spek (Discord, GitHub, YouTube, TikTok, Spotify, Steam, Roblox, PayPal, Bitcoin, dst.), digambar ulang sebagai **SVG orisinal AKSA** (bukan aset resmi brand yang di-scrape).
- **Search** real-time (fuzzy, termasuk alias — "ig" match Instagram).
- **Favorite** & **Recently Used** — dua strip di atas grid utama, disimpan per-user.
- **Preview** — hover/tap menampilkan ikon dalam ukuran actual pada mock link card.
- **Custom SVG upload** & **Emoji support** — untuk ikon yang tidak ada di library bawaan (validasi SVG di-sanitize server-side untuk cegah XSS, memakai `isomorphic-dompurify` yang sudah jadi dependency).

---

## 2. Link Card — Struktur Lengkap

```
[⠿ drag] [Icon] Judul Link                    [●●● menu]
          URL · Deskripsi singkat
          [Badge kategori] [👁 1.2k klik]
```

**Field & aksi per card:** drag handle, icon, title, URL, description, category, badge, color/gradient, visibility toggle, schedule, expire time, password protection indicator, QR code (quick generate), analytics ringkas (click counter inline), duplicate, copy link, favorite, edit, delete, open-in-new-tab toggle, custom icon override, hover animation preview.

Menu `⋯` mengelompokkan aksi sekunder (duplicate/copy/delete) agar card tidak penuh ikon sekaligus — hanya aksi paling sering dipakai (edit, visibility, favorite) yang tampil permanen di card, sisanya di menu (prinsip clarity dokumen 00 §7).

---

## 3. Link Settings — 4 Tab

### Tab General
Title, URL, Description, Subtitle, Tags (multi-select/chip input).

### Tab Appearance
Color, Gradient (color-stop editor sama seperti dokumen 07), Shadow, Glow, Radius, Border, Width/Height (persen relatif terhadap container, bukan pixel absolut — agar tetap responsif), Alignment.

### Tab Behavior
Open New Tab / Same Tab, Password Protection (hash di server, tidak pernah dikirim plaintext ke client setelah diset), Scheduled Publish (`publishAt`), Expiration Date (`expireAt` — dieksekusi oleh job dokumen 03 §4), Redirect Delay (untuk halaman interstitial opsional), UTM Tracking (auto-append parameter UTM ke URL tujuan, dikonfigurasi per link).

### Tab Advanced
Custom CSS Class (terbatas ke whitelist class aman, dokumen 01 token — mencegah user menyuntik CSS arbitrer yang merusak layout global), Custom Icon override, Custom Badge, Analytics detail link-in, **A/B Testing** (dua varian judul/URL, split traffic, laporan CTR per varian), **GEO Restriction** (tampilkan/sembunyikan link berdasarkan negara pengunjung, dari IP geolocation kasar).

---

## 4. Folder & Kategori

- Link bisa dikelompokkan ke **folder** (baru — relasi `ProfileLink.folderId`) untuk profil dengan banyak link (mis. kreator dengan puluhan produk).
- Folder ditampilkan sebagai section collapsible di halaman publik, atau sebagai tab, tergantung Layout yang dipilih (dokumen 07).
- Kategori (tag pendek: "Sosial", "Produk", "Komunitas") dipakai untuk filter cepat di dashboard, terpisah dari folder (folder = pengelompokan tampilan publik, kategori = filter kerja internal).

---

## 5. Bulk Actions

Dipicu lewat **Multi Select** (checkbox muncul saat mode select aktif):

- Bulk Delete (dengan konfirmasi + soft-delete, dokumen 04 §1 — bisa di-undo sesaat via toast "Batalkan").
- Bulk Edit (ubah kategori/visibility banyak link sekaligus lewat satu form).
- Bulk Visibility, Bulk Category — form ringkas khusus untuk perubahan massal satu atribut.
- Bulk Export/Import — CSV/JSON, divalidasi Zod schema saat import (baris invalid dilaporkan spesifik, bukan gagal seluruhnya tanpa penjelasan).

---

## 6. Search & Filter Dashboard

- Search real-time di atas daftar link (judul, URL, tag).
- Filter: kategori, folder, status (aktif/nonaktif/expired/scheduled), favorite/pinned.
- **Pin Link** — link yang di-pin selalu muncul di atas daftar dashboard (membantu link yang sering diedit), terpisah dari urutan tampil di profil publik (yang diatur drag-and-drop).

---

## 7. QR Code

- Generate on-demand per link (`qrcode` sudah jadi dependency project) — SVG/PNG, bisa diunduh, dengan opsi warna sesuai `profileAccentColor` (integrasi visual, bukan QR hitam-putih generik).
- QR scan tercatat sebagai `AnalyticsEvent type=qr_scan` (dokumen 03 §10) untuk analytics terpisah dari klik link biasa.

---

## 8. Validasi & Keamanan

- URL divalidasi format + dicek terhadap daftar domain berbahaya dasar (opsional integrasi safe-browsing API) sebelum disimpan.
- Password protection: hash bcrypt (sudah dependency `bcryptjs`), dicek server-side saat pengunjung publik mencoba akses link terproteksi lewat halaman interstitial khusus.
- Rate limit pada redirect link publik (`app/l/[id]/route.ts` existing) sesuai dokumen 03 §6 untuk cegah abuse/spam klik.

---

**Selanjutnya:** Dokumen **09 — Widget System** (Widget SDK, Builder, Store, konfigurasi & permission).
