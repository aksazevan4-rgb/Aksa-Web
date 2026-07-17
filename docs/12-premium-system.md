# 12 — Premium System
## AKSA AboutMe

> Basis existing: model `PremiumPlan`, `PremiumFeature`, `PremiumPlanFeature`, `Plan` enum di User, `PremiumSection.tsx`, `PremiumGate.tsx`, `PlanBadge.tsx`. Dokumen ini melengkapi sisi billing, credits, dan coupon yang belum ada.

---

## 1. Plan Structure

- `PremiumPlan`/`PremiumFeature`/`PremiumPlanFeature` (existing) tetap jadi model relasional plan↔fitur — memungkinkan admin menambah/mengubah fitur per plan lewat Admin Panel tanpa deploy kode baru (dokumen 14).
- `PremiumGate.tsx` (existing) diperluas: menerima `featureKey` dan otomatis mengecek `PremiumPlanFeature` user aktif, bukan hardcode kondisi per fitur di banyak tempat (mencegah duplicate logic, dokumen 18).

---

## 2. Billing & Payment

| Metode | Catatan |
|---|---|
| **Stripe** | Kartu internasional, subscription recurring, invoice otomatis |
| **QRIS** | Metode lokal Indonesia untuk pembayaran satu kali (upgrade plan, beli credits) — integrasi via payment gateway lokal yang mendukung QRIS (dipilih saat implementasi, bukan diikat di dokumen ini) |

- Webhook pembayaran (`app/api/*/webhook`, pola sama seperti webhook Discord bot existing) memperbarui `User.plan`, `premiumSince`, `premiumExpiresAt` dan mencatat `AuditLog`.
- **Invoices** — riwayat transaksi ditampilkan di Settings → Billing, bisa diunduh sebagai PDF (dokumen skill `pdf` dipakai saat implementasi generate invoice).

---

## 3. Subscription Lifecycle

```
TRIAL (opsional) → ACTIVE → (gagal bayar) → PAST_DUE → (grace period) → EXPIRED → FREE
```

- Notifikasi otomatis (dokumen 03 §5) dikirim di titik: 7 hari sebelum expired, saat expired, saat pembayaran gagal — agar tidak ada "downgrade mengejutkan" tanpa peringatan.
- Downgrade ke FREE **tidak menghapus data** premium user (tema custom, widget premium yang sudah dikonfigurasi) — hanya dinonaktifkan (`enabled=false`) sampai upgrade lagi, sesuai prinsip "jangan hapus fitur yang sudah ada" (dokumen 00).

---

## 4. Credits System (Mata Uang Virtual)

- `User.credits Int @default(0)` (field baru, ditambahkan additive sesuai strategi migrasi dokumen 04 §6).
- Didapat dari: pembelian langsung, bonus event, referral, atau termasuk dalam paket plan tertentu.
- Dipakai untuk: beli badge (dokumen 10 §5), beli item Marketplace (dokumen 13), boost profil (opsional fitur visibilitas tambahan di explore/discovery bila ada).
- Setiap transaksi credit (masuk/keluar) dicatat di tabel `CreditTransaction` (baru) untuk transparansi riwayat penuh ke pengguna.

---

## 5. Coupons

- `Coupon` model (baru): kode, tipe diskon (persen/nominal/gratis-bulan), batas pemakaian, tanggal berlaku, target plan tertentu (opsional).
- Divalidasi di Server Action checkout sebelum diteruskan ke payment gateway — termasuk cek "sudah dipakai user ini belum" untuk kupon sekali pakai per user.
- Dikelola dari Admin Panel (dokumen 14).

---

## 6. Premium Boost (Visibility, opsional)

Jika produk punya fitur discovery/explore publik (di luar scope wajib spek awal, dicatat sebagai opsi masa depan): user premium bisa "boost" profil pakai credits agar lebih terlihat di halaman discovery — fitur ini eksplisit ditandai opsional/fase lanjutan, bukan komitmen wajib rilis awal.

---

## 7. Premium-Gated Assets (Ringkasan Lintas Modul)

| Modul | Contoh Fitur Premium |
|---|---|
| Appearance (07) | Tema eksklusif, video background, upload font kustom |
| Widgets (09) | Widget custom HTML, batas jumlah widget lebih tinggi |
| Badges (10) | Badge purchasable eksklusif, jumlah featured badge lebih banyak |
| Links (08) | Batas jumlah link lebih tinggi, A/B testing, GEO restriction |
| Public Profile (11) | Video background, custom cursor, particle effects |

Semua gate di atas dicek lewat mekanisme tunggal `PremiumGate`/Server Action check (§1) — bukan pengecekan `if (user.plan === "PREMIUM")` tersebar manual di banyak file.

---

## 8. Transparansi & Etika Billing

- Halaman pricing (public, `LandingPricing.tsx` existing) dan halaman Billing internal menampilkan harga final tanpa biaya tersembunyi.
- Pembatalan langganan bisa dilakukan mandiri oleh user (self-service), tidak memerlukan kontak support sebagai satu-satunya jalan (menghindari dark pattern "susah cancel").
- Auto-renewal dijelaskan eksplisit saat checkout + reminder sebelum penagihan berikutnya (§3).

---

**Selanjutnya:** Dokumen **13 — Marketplace & Template** (Theme/Template/Widget/Badge Marketplace, review & rating).
