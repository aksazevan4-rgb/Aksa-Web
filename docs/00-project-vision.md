# 00 — Project Vision
## AKSA AboutMe — Premium Link-in-Bio Platform

> Dokumen ini adalah fondasi dari seluruh master project. Semua dokumen berikutnya (01–18) harus konsisten dengan visi, prinsip, dan batasan yang ditetapkan di sini.

---

## 1. Ringkasan Eksekutif

AKSA AboutMe adalah platform *link-in-bio* premium generasi berikutnya: satu halaman profil publik yang dapat dikustomisasi penuh, didukung dashboard kelas enterprise untuk mengelola link, widget, badge, tema, dan monetisasi. Target kualitasnya setara — atau melampaui — platform seperti guns.lol dan drift.rip dalam hal kelengkapan fitur dan pengalaman pengguna, tetapi dengan identitas visual, kode, dan arsitektur yang 100% orisinal.

Project ini **bukan project baru dari nol** — ini adalah rebuild bertahap atas codebase AKSA yang sudah berjalan (Next.js 16, App Router, Prisma, NextAuth, ~278 file existing mencakup dashboard, admin panel, appearance builder, widget system dasar, dan public profile). Prinsip utamanya: **tingkatkan, jangan hancurkan** — fitur lama tetap ada, diperkuat dan diintegrasikan ke arsitektur baru yang lebih modular.

---

## 2. Masalah yang Ingin Diselesaikan

Platform link-in-bio yang populer di komunitas Discord/gaming/kreator saat ini umumnya punya pola masalah yang sama:

- **UX tambal-sulam** — fitur ditambah terus tanpa audit desain ulang, sehingga dashboard terasa seperti kumpulan halaman lepas, bukan satu produk yang koheren.
- **Kustomisasi dangkal** — banyak toggle on/off, tapi minim live preview real-time dan kontrol granular (spacing, animasi, layout builder).
- **Badge & gamifikasi sebagai tempelan** — bukan sistem yang punya progression, requirement, dan showcase yang jelas.
- **Performa dikorbankan demi fitur** — halaman berat, CLS tinggi, hydration mismatch, karena arsitektur tidak feature-based dan tidak memakai server components/streaming secara maksimal.
- **Identitas visual generik atau meniru** — banyak platform sejenis terlihat mirip satu sama lain.

AKSA AboutMe dibangun untuk menyelesaikan kelimanya sekaligus, dengan disiplin engineering yang ketat (lihat dokumen 18 — Development Rules).

---

## 3. Target Pengguna

| Segmen | Kebutuhan Utama |
|---|---|
| **Kreator konten & streamer** | Profil yang menonjolkan identitas, integrasi Spotify/Discord/media sosial, statistik yang bisa dipamerkan |
| **Komunitas Discord & gaming** | Badge, showcase, identitas visual yang "flex-able", link ke server/produk |
| **Developer & builder** | Portofolio ringkas dengan link ke GitHub, proyek, blog, dan widget kustom |
| **Bisnis kecil & freelancer** | Satu link untuk semua channel penjualan, dengan analytics dan proteksi (password, jadwal, expire) |
| **Power user premium** | Kustomisasi mendalam: tema, animasi, layout builder, domain kustom |

Semua persona di atas berbagi satu ekspektasi: **dashboard harus terasa seperti produk SaaS profesional**, bukan panel admin generik.

---

## 4. Visi Produk

> "Satu link, identitas penuh — dikelola lewat dashboard yang terasa secepat dan serapi produk SaaS kelas atas."

Tiga pilar visi:

1. **Kelengkapan fitur setara kompetitor**, tanpa menyalin satu pun kode/aset/identitas visual mereka.
2. **Kualitas rekayasa yang tidak bisa ditawar** — nol TypeScript error, nol hydration mismatch, Lighthouse ≥95, arsitektur modular yang scalable.
3. **Karakter visual AKSA sendiri** — bahasa desain (warna, tipografi, motion) yang dikenali sebagai identitas AKSA, bukan turunan siapa pun.

---

## 5. Perbedaan dengan Kompetitor (Diferensiasi)

Dibandingkan platform referensi (guns.lol, drift.rip, dan sejenisnya), AKSA AboutMe membedakan diri lewat:

- **Theme Builder dengan live preview tanpa refresh**, lengkap dengan autosave, draft/publish, dan version history — bukan sekadar daftar toggle.
- **Badge system dengan progression nyata** (requirement, progress bar, unlock animation, showcase), bukan badge statis yang hanya dekorasi.
- **Widget Builder drag-and-drop** dengan widget library terkategori, bukan form konfigurasi linear.
- **Arsitektur feature-based dari awal**, sehingga setiap modul (links, badges, widgets, premium) punya boundary jelas dan bisa dikembangkan independen.
- **Command Palette (Ctrl+K)** sebagai warga kelas satu di seluruh dashboard, bukan tambahan kosmetik.
- **Semua state (loading, empty, error) didesain, bukan dibiarkan default browser.**

---

## 6. Branding & Identitas Visual

- **Nama produk:** AKSA AboutMe
- **Prinsip nama & aset:** seluruh ikon, ilustrasi, font, dan komponen visual harus orisinal atau dari sumber berlisensi bebas pakai komersial (mis. font open-source seperti keluarga font yang sudah ada di project: Inter, Manrope, Outfit, Sora, Space Grotesk, dll). Tidak ada aset yang diambil langsung dari platform referensi.
- **Nada visual:** premium, tenang, sedikit "glass" (glassmorphism halus), dengan aksen warna yang berani tapi tidak berlebihan — akan dirinci penuh di dokumen 01 (Design System) mencakup palet warna, skala tipografi, dan token spacing.
- **Nada komunikasi produk:** percaya diri, ringkas, tidak sok formal — cocok untuk audiens kreator dan komunitas online, tapi copy dashboard tetap presisi dan profesional (bukan playful berlebihan di area kerja).

---

## 7. Filosofi UX

1. **Clarity over cleverness** — setiap layar punya satu tujuan utama yang jelas sebelum ditambah kompleksitas.
2. **Live feedback selalu ada** — perubahan appearance/theme harus terlihat instan di preview; tidak ada aksi penting tanpa konfirmasi visual (toast, state loading, animasi transisi).
3. **Power user tidak dikorbankan demi pemula** — command palette, shortcut keyboard, dan bulk actions tersedia untuk yang butuh kecepatan, tapi tersembunyi rapi untuk yang tidak butuh.
4. **Tidak ada dead end** — setiap empty state dan error state punya arah tindakan berikutnya (CTA yang jelas), bukan sekadar pesan "tidak ada data."

---

## 8. Filosofi Desain

1. **Konsistensi sebelum variasi** — satu skala spacing, satu skala radius, satu skala shadow dipakai di seluruh produk sebelum ada pengecualian kasus per kasus.
2. **Hierarki visual eksplisit** — ukuran, bobot, dan kontras warna dipakai secara sengaja untuk mengarahkan mata, bukan sekadar dekorasi.
3. **Motion bermakna** — animasi dipakai untuk menjelaskan hubungan sebab-akibat (elemen muncul dari mana, badge ter-unlock bagaimana), bukan sekadar mempercantik.
4. **Dark-first, light-ready** — desain utama dioptimalkan untuk dark theme (sesuai budaya komunitas target), tapi light theme tetap warga kelas satu, bukan tempelan.

---

## 9. Filosofi Premium

- **Gratis tetap terasa lengkap** — fitur inti (link management dasar, satu tema, badge dasar) harus tetap membuat produk terasa berguna tanpa premium.
- **Premium = kedalaman & skala, bukan kunci fitur inti** — premium membuka: tema/animasi eksklusif, widget lanjutan, badge eksklusif, domain kustom, analytics lanjutan, batas link/widget lebih tinggi.
- **Transparansi harga & billing** — invoice, riwayat langganan, dan status paket harus mudah ditemukan dan dipahami tanpa dark pattern.
- **Upgrade path terasa natural** — ketika pengguna gratis menyentuh batas (mis. jumlah widget), produk menawarkan upgrade secara kontekstual, bukan lewat pop-up agresif.

---

## 10. Roadmap Tingkat Tinggi

Roadmap mengikuti urutan dokumen master project (00–18), dieksekusi bertahap agar setiap modul lolos audit kualitas sebelum lanjut:

| Fase | Fokus | Dokumen Terkait |
|---|---|---|
| **Fase 0 — Fondasi** | Visi produk (dokumen ini), Design System, Frontend Architecture | 00, 01, 02 |
| **Fase 1 — Backend & Data** | Backend Architecture, Database Design, Auth System | 03, 04, 05 |
| **Fase 2 — Inti Dashboard** | Dashboard System, Profile Customization, Link Management | 06, 07, 08 |
| **Fase 3 — Engagement** | Widget System, Badge System, Public Profile | 09, 10, 11 |
| **Fase 4 — Monetisasi & Ekosistem** | Premium System, Marketplace & Template, Admin Panel | 12, 13, 14 |
| **Fase 5 — Pengerasan Produk** | API & Integrations, Performance & Security, Testing & Deployment | 15, 16, 17 |
| **Berkelanjutan** | Development Rules ditegakkan di setiap fase, bukan di akhir | 18 |

Setiap fase menghasilkan kode yang **lolos `npm run check`** (lint + typecheck + prisma validate + build) sebelum fase berikutnya dimulai — sesuai aturan di dokumen 18.

---

## 11. Kriteria Sukses (Definition of Done untuk Visi Ini)

Project ini dianggap berhasil ketika:

- [ ] Setiap dokumen 01–18 selesai dan saling konsisten dengan dokumen ini.
- [ ] Tidak ada fitur existing yang hilang dari rebuild.
- [ ] Lighthouse score ≥95 di halaman publik profil.
- [ ] Nol TypeScript/Prisma/build error di seluruh siklus pengembangan.
- [ ] Desain akhir tidak menyalin satu pun aset/kode/identitas visual dari platform referensi.

---

**Selanjutnya:** Dokumen **01 — UI & UX Design System** (palet warna, tipografi, spacing, glassmorphism, dan seluruh aturan komponen visual).
