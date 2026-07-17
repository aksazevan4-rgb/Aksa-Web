# 13 — Marketplace & Template
## AKSA AboutMe

> Bertumpu pada model `MarketplaceListing`/`MarketplaceReview` (dokumen 04 §2.3) dan `ProfileTemplate` existing.

---

## 1. Struktur Marketplace

Empat jenis listing dalam satu sistem generik (`ListingType`): **Theme**, **Template**, **Widget Preset**, **Badge** (badge yang memang dijual, terhubung ke §5 dokumen 10). Satu arsitektur listing dipakai untuk semua tipe — bukan empat sistem terpisah — agar UI browse/search/review konsisten dan kode tidak terduplikasi (dokumen 18).

---

## 2. Alur Publikasi (Creator Side)

```
Buat item (Theme Builder/Widget preset/Template) 
  → "Publikasikan ke Marketplace" 
  → isi judul, deskripsi, harga (credits/gratis) 
  → status PENDING 
  → review Admin (dokumen 14) 
  → APPROVED (tampil publik) / REJECTED (alasan dikirim ke creator)
```

- Review manual di awal (mencegah konten/kode berbahaya atau plagiat aset pihak ketiga) — otomasi moderasi tambahan (deteksi duplikat) bisa ditambah di fase lanjutan, bukan wajib rilis awal.
- Creator mendapat **Template Creator Badge** (dokumen 10) otomatis setelah listing pertama disetujui.

---

## 3. Alur Pembelian (Buyer Side)

- Beli pakai **Credits** (dokumen 12 §4) — Server Action mengecek saldo, memotong credit, menyalin `payload` (konfigurasi tema/widget/template) ke akun pembeli, menambah `downloads` counter.
- Item gratis (`priceCredits=0`) langsung bisa "Import" tanpa transaksi credit, tetap tercatat sebagai download untuk statistik popularitas.
- Setelah dibeli, item menjadi milik user (bisa dikustomisasi lebih lanjut tanpa memengaruhi listing asli — copy, bukan referensi live).

---

## 4. Review & Rating

- Hanya pembeli/pengguna yang sudah import item yang bisa memberi `MarketplaceReview` (mencegah review palsu dari yang belum pernah pakai).
- Rating rata-rata (`MarketplaceListing.rating`) dihitung ulang (recompute, bukan running average yang bisa drift) setiap ada review baru — dijalankan sebagai bagian dari Server Action submit review, bukan job terpisah (volume rendah, tidak perlu antrian).

---

## 5. Discovery & Browse

- Filter: tipe, kategori, harga (gratis/berbayar), rating, terbaru/terpopuler.
- Search judul & deskripsi.
- Halaman detail listing menampilkan **preview interaktif** (untuk Theme: live preview sama seperti Theme Builder dokumen 07 §2, dirender dengan payload listing tanpa perlu dibeli dulu — "coba sebelum beli" secara visual saja, tanpa bisa dipakai permanen sebelum transaksi).

---

## 6. Template (khusus)

- Beda dengan `ProfileTemplate` existing (yang menyimpan konfigurasi dashboard user sendiri): `MarketplaceListing type=TEMPLATE` adalah **lapisan distribusi** — pengguna bisa mempublikasikan `ProfileTemplate` miliknya ke marketplace untuk dipakai orang lain, dengan `payload` marketplace menunjuk/menyalin struktur `ProfileTemplate` terkait.

---

## 7. Keamanan Marketplace

- `payload` listing tervalidasi Zod sesuai skema tiap `ListingType` sebelum disimpan — mencegah struktur data sewenang-wenang yang bisa merusak render di sisi pembeli.
- Widget Preset **tidak pernah** membawa kode eksekusi (§7 dokumen 09) — hanya konfigurasi terhadap widget yang sudah terdaftar di registry sistem, bukan widget arbitrer buatan user.

---

**Selanjutnya:** Dokumen **14 — Admin Panel** (User Management, Moderation, Analytics global, Feature Flags).
