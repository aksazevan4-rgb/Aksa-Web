# 10 — Badge System
## AKSA AboutMe

> Bertumpu pada model `Badge`/`UserBadge` (dokumen 04 §2.1). Desain visual badge **wajib orisinal AKSA** (layout card, ikon, animasi baru) — tidak meniru layout badge platform referensi.

---

## 1. Badge Engine (Requirement System)

Setiap badge punya `requirement: Json` yang dievaluasi oleh worker (dokumen 03 §4). Contoh tipe rule:

```json
{ "type": "linkClicksTotal", "threshold": 1000 }
{ "type": "accountAgeDays", "threshold": 365 }
{ "type": "adminGrant" }                          // hanya lewat Admin Panel, tidak otomatis
{ "type": "purchase", "priceCredits": 500 }
{ "type": "eventParticipation", "eventKey": "anniversary-2027" }
```

Engine ini generik — menambah badge baru (kategori apa pun dari daftar spek: Staff, Verified, Premium, Donator, Developer, Early Supporter, Community Helper, Moderator, Bug Hunter, Partner, Creator, Streamer, Artist, Designer, Photographer, Programmer, Open Source, Contributor, Champion, Winner, Top User, Top Supporter, Server Booster, Image Host, Domain Owner, Marketplace Seller, Template Creator, Sponsor, OG Member, Event/Holiday/Limited/Season/Anniversary/Achievement/Level/Rank/Custom/Dynamic/Animated/NFT/Community/Founder Badge, Beta Tester, VIP, Diamond, Legend, Master, Elite, dst.) **tidak butuh kode baru**, cukup insert data `Badge` baru dengan rule requirement yang sesuai — mencegah proliferasi kode duplikat untuk tiap badge (dokumen 18).

---

## 2. Badge Card — Desain (Orisinal)

```
┌───────────────────┐
│   [ikon badge]    │  ← glow sesuai rarity (dokumen 01 §6.2)
│   Nama Badge      │
│   ▓▓▓▓▓▓░░░░ 68%  │  ← progress bar, hanya tampil jika belum unlocked
│   Rarity · Kategori│
└───────────────────┘
```

- Warna glow per rarity: Common (netral), Rare (sky), Epic (indigo), Legendary (amber), Limited (gradient indigo→amber khas AKSA — bukan pelangi generik).
- **Unlock Animation** — saat badge baru terbuka: card melakukan efek "reveal" (scale + glow pulse, `duration-slow` + `ease-emphasis`, dokumen 01 §8) disertai toast konfirmasi + opsi share.

---

## 3. Badge Inventory & Collection

- **Badge Inventory** — semua badge yang dimiliki user (unlocked), grid dengan search & filter kategori.
- **Badge Collection** — progres semua badge yang *belum* dimiliki tapi bisa dikejar, menampilkan requirement dengan jelas (transparansi, bukan hidden mystery-only) kecuali untuk kategori yang memang didesain rahasia (Event/Limited tertentu, ditandai eksplisit "???" hanya untuk itu).
- **Badge Showcase / Featured Badge** — user memilih maksimal N badge (batas per plan, FREE lebih sedikit dari PREMIUM) untuk ditampilkan menonjol di profil publik (`UserBadge.featured`).

---

## 4. Equip / Unequip

- `UserBadge.equipped` menentukan badge mana yang tampil di area badge profil publik (beda dari `featured` yang untuk showcase besar) — user bisa equip beberapa badge kecil di sebelah nama, dan featured beberapa badge besar di section terpisah.
- Perubahan equip/featured tersimpan langsung (bukan perlu "publish" terpisah seperti Theme Builder, karena aksinya lebih ringan/reversible instan).

---

## 5. Badge Marketplace & Purchase

- Badge dengan `isPurchasable=true` dibeli pakai **Credits** (mata uang virtual, lihat dokumen 12) lewat Server Action yang mengecek saldo, memotong credit, insert `UserBadge` dengan `acquiredVia=PURCHASE`, dan mencatat `AuditLog`.
- Badge hasil admin grant (`ADMIN_GRANT`) hanya bisa dilakukan dari Admin Panel (dokumen 14) oleh role `ADMIN`/`OWNER`, tercatat di Audit Log dengan alasan wajib diisi (field alasan, bukan grant tanpa jejak).

---

## 6. Badge Search & Filter (Dashboard)

- Search nama/deskripsi badge.
- Filter: kategori, rarity, status (dimiliki/belum), purchasable/tidak.
- Sort: terbaru diunlock, rarity tertinggi, alfabetis.

---

## 7. Seasonal & Dynamic Badge

- **Season/Event Badge** — punya `availableFrom`/`availableUntil` (field tambahan di `Badge` bila dibutuhkan), otomatis tidak lagi bisa di-unlock baru setelah periode berakhir, tapi yang sudah dimiliki tetap ada selamanya (tidak dicabut retroaktif — prinsip "jangan hapus fitur/hak yang sudah didapat" dokumen 00).
- **Dynamic Badge** — requirement yang bergantung ranking relatif (mis. "Top 10 Supporter bulan ini") dievaluasi ulang tiap rollup analytics (dokumen 03 §10), badge bisa berpindah tangan sesuai definisi yang jelas ke pengguna (dikomunikasikan lewat deskripsi badge, bukan mengejutkan pengguna).

---

## 8. Aksesibilitas & Kejelasan

- Setiap badge wajib punya deskripsi yang menjelaskan requirement dalam bahasa manusia (bukan hanya kode rule internal) — ditulis manual saat badge dibuat via Admin Panel.
- Progress bar selalu disertai angka (mis. "680/1000 klik"), tidak hanya visual persentase, demi aksesibilitas dan kejelasan (dokumen 01 §3.4).

---

**Selanjutnya:** Dokumen **11 — Public Profile** (dynamic background, live widgets, Discord/Spotify presence, visitor counter, SEO).
