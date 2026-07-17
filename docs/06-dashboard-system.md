# 06 — Dashboard System
## AKSA AboutMe

> Dashboard existing (`app/dashboard/layout.tsx`, `components/dashboard/Sidebar.tsx`, `Topbar.tsx`, `CommandPalette.tsx`) menjadi basis; dokumen ini mendetailkan struktur navigasi lengkap dan halaman Overview/Analytics sesuai spek sidebar penuh yang diminta.

---

## 1. Struktur Sidebar Lengkap

### 1.1 Grup Navigasi Utama
```
🔍 Search (trigger Command Palette)
── Account
   Overview
   Analytics
── Profile
   Profile
   Customize
   Links
── Appearance
   Themes
   Widgets
   Badges
── Premium
   Premium
   Billing
── Platform
   Domains
   Image Hosting
   Templates
   Integrations
── System
   Settings
   API
   Developer
── Support
   Help Center
   Changelog
   Documentation
   Feedback
```

### 1.2 Bagian Bawah Sidebar (User Card)
```
[Avatar] Username          ● online
UID: ak_9f2x...
─────────────
My Profile     (buka public profile di tab baru)
Share Profile  (buka modal share + QR + copy link)
─────────────
Support · Discord Community
Quick Links (link cepat yang di-pin user)
```

**Perilaku:** grup navigasi collapsible per section (ingat state terakhir per user via localStorage-equivalent — di sini disimpan sebagai preferensi UI ringan, bukan data server penting). Item aktif ditandai dengan `accent-default` + indikator garis kiri, bukan hanya perubahan warna teks (aksesibilitas — dokumen 01 §3.4).

---

## 2. Command Palette (Ctrl+K)

- Fuzzy search lintas: halaman navigasi, aksi cepat ("Buat link baru", "Ganti tema"), pengaturan spesifik ("Ubah password"), bahkan link individual milik user ("buka link: portfolio").
- Kategori hasil dikelompokkan: **Navigasi**, **Aksi**, **Pengaturan**, **Link Saya** — bukan daftar flat tanpa struktur.
- Alias pencarian didefinisikan per item (§13 dokumen 01) agar istilah umum tetap match (mis. ketik "logout" match ke aksi "Keluar").
- Recently used items muncul default saat command palette dibuka kosong (sebelum user mengetik apa pun).

---

## 3. Overview Page

Struktur grid (bukan daftar vertikal panjang):

1. **Header row** — sapaan personalisasi + status akun ringkas (plan aktif, security score ringkas dari dokumen 05).
2. **Stat cards row** (4 kartu): Profile Views (7 hari), Link Clicks (7 hari), Active Links, Badge Terbaru.
3. **Quick Actions row** — tombol besar: "Tambah Link", "Ganti Tema", "Lihat Profil Publik", "Undang via Referral" (jika ada program referral, ditentukan di dokumen 12).
4. **Activity feed** — 10 aktivitas terakhir (link diklik banyak, badge baru, komentar guestbook baru) dengan link langsung ke detail terkait.
5. **Upgrade nudge** (kontekstual, hanya muncul jika relevan — mis. mendekati limit widget) — sesuai filosofi premium dokumen 00 §9, bukan promosi generik yang selalu tampil.

---

## 4. Analytics Page

Memakai `AnalyticsClient.tsx` existing sebagai basis, diperluas:

- **Rentang waktu**: 24 jam / 7 hari / 30 hari / kustom — data diambil dari `AnalyticsSummary` (dokumen 04) untuk rentang lama, `AnalyticsEvent` real-time untuk hari berjalan (dokumen 03 §10).
- **Breakdown per link** — tabel sortable: klik, CTR relatif terhadap profile view, tren naik/turun.
- **Sumber traffic** — referrer dikelompokkan (langsung, sosial media, pencarian) sejauh data tersedia dari header referrer, tanpa fingerprinting invasif.
- **Export** — unduh CSV rentang data yang dipilih (dipakai juga di fitur bulk export dokumen 08).

---

## 5. Notification System (UI Level)

- `NotificationBell` (existing) menampilkan badge count dari unread notifications (Redis-cached, dokumen 03 §3).
- `NotificationCenter` (existing) dikelompokkan per kategori: Sistem, Badge, Sosial (guestbook/reaksi), Billing — dengan tab filter, bukan daftar campur semua jenis.
- Setiap notifikasi actionable (klik → langsung ke halaman terkait), bukan hanya informasi pasif.

---

## 6. Quick Actions & Shortcuts

| Shortcut | Aksi |
|---|---|
| `Ctrl/Cmd + K` | Buka Command Palette |
| `Ctrl/Cmd + N` | Tambah Link baru (dari halaman manapun di dashboard) |
| `Ctrl/Cmd + S` | Simpan draft (di Theme Builder/Widget Builder — dokumen 07/09) |
| `G` lalu `O` | Ke halaman Overview (Gmail-style navigation, opsional power-user) |

---

## 7. Layout & Responsive Dashboard

- Desktop (`≥lg`): sidebar tetap terlihat (collapsible ke icon-only mode).
- Tablet (`md`): sidebar jadi drawer overlay, dipicu tombol hamburger di Topbar.
- Mobile (`sm`): navigasi utama pindah ke bottom-tab untuk 4 item paling sering dipakai (Overview, Links, Appearance, Profil Publik), sisanya lewat menu "Lainnya" — bukan memaksakan sidebar penuh di layar sempit.

---

## 8. Help & Support Terintegrasi

- **Help Center** — artikel bantuan terkategori, dicari lewat search yang sama dengan Command Palette.
- **Changelog** — daftar update terbaru (dipetakan dari `CHANGELOG.md`/`CHANGELOG-N.md` yang sudah ada di project, ditampilkan sebagai in-app changelog, bukan file statis saja).
- **Documentation** — panduan fitur dashboard, ditulis untuk pengguna akhir (beda dari dokumen teknis internal ini).
- **Feedback** — form ringkas + kategori (bug/fitur/lainnya), masuk ke Admin Panel (dokumen 14) sebagai item yang bisa ditriase.

---

**Selanjutnya:** Dokumen **07 — Profile Customization** (Theme Builder, Layout Builder, Font/Effect Manager, Preset & Marketplace tema).
