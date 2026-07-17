# 14 — Admin Panel
## AKSA AboutMe

> Basis existing sangat kuat: `app/dashboard/admin/*` sudah mencakup users, content, premium, analytics, logs, showcase, status, config. Dokumen ini menambahkan modul yang belum ada (Badge/Widget/Theme Management, Marketplace moderation, Feature Flags, Security Center) dan merapikan yang sudah ada ke standar UI dokumen 01.

---

## 1. Struktur Navigasi Admin (Sidebar Internal Terpisah dari Dashboard User)

```
Overview (ringkasan metrik global)
── Users
   User Management (existing: AdminUsersClient.tsx)
   Reports (laporan/flag dari user)
── Content
   Site Content (existing: about, ecosystem, experience, focus, projects, services, stats, techstack, testimonials)
   SEO (existing)
   Announcements (baru)
── Growth
   Premium Management (existing: PremiumPlansClient.tsx)
   Coupons (baru, dokumen 12 §5)
   Subscriptions overview (baru)
── Ecosystem
   Badge Management (baru)
   Theme Management (baru)
   Widget Management (baru)
   Marketplace Moderation (baru)
   Templates (baru — kurasi template unggulan)
── Operations
   Analytics (existing: AdminAnalyticsClient.tsx)
   Audit Logs (existing)
   Security Center (baru)
   Feature Flags (baru)
   Site Config (existing: SiteConfigForm.tsx)
   System Status (existing)
```

---

## 2. User Management (perluasan existing)

- Aksi existing (ubah plan/role/status — `app/dashboard/admin/users/actions.ts`) dipertahankan.
- Ditambah: lihat riwayat login (`LoginEvent`), lihat badge dimiliki, grant/revoke badge langsung dari profil user (terhubung ke §5 dokumen 10, wajib isi alasan → `AuditLog`).
- Bulk action pada user list (ban massal, ubah plan massal) mengikuti pola konfirmasi + audit log yang sama seperti aksi tunggal — tidak ada bulk action tanpa jejak audit.

---

## 3. Badge Management

- CRUD `Badge` (dokumen 04 §2.1) — form dengan preview live badge card (memakai komponen badge asli, dokumen 10 §2, bukan preview terpisah).
- Editor `requirement` — UI form terstruktur per tipe rule (dropdown tipe + field sesuai — bukan textarea JSON mentah untuk admin non-teknis, meski JSON mentah tetap tersedia sebagai mode lanjutan/advanced).
- Statistik per badge: jumlah pemilik, tren unlock mingguan.

---

## 4. Theme & Widget Management

- **Theme Management** — kurasi preset resmi AKSA (§7 dokumen 07), toggle preset premium/gratis, arsipkan preset lama tanpa menghapus dari akun yang sudah memakainya.
- **Widget Management** — kelola `WidgetDefinition` (aktifkan/nonaktifkan widget secara global, tandai premium), tanpa perlu deploy kode untuk perubahan status widget yang sudah ada di registry (dokumen 09 §1).

---

## 5. Marketplace Moderation

- Antrian `MarketplaceListing status=PENDING` dengan preview (§5 dokumen 13), tombol Approve/Reject + alasan (wajib untuk Reject, opsional untuk catatan internal saat Approve).
- Laporan konten marketplace bermasalah dari user (`Reports`) masuk ke antrian yang sama untuk item yang sudah live, memungkinkan takedown listing yang sudah disetujui sebelumnya jika belakangan terbukti bermasalah.

---

## 6. Analytics Global (perluasan existing)

- `AdminAnalyticsClient.tsx` diperluas dengan metrik: pertumbuhan user (harian/mingguan), distribusi plan, revenue (dari transaksi Stripe/QRIS, dokumen 12), top badge/widget/theme terpopuler.
- Sumber data tetap dari `AnalyticsSummary`/rollup yang sama dipakai dashboard user (dokumen 03 §10), diagregasi lintas-user untuk level admin — tidak ada pipeline analytics kedua yang terpisah.

---

## 7. Security Center

- Ringkasan lintas-user: jumlah login gagal beruntun tinggi (indikasi brute force), lonjakan rate-limit hit (dokumen 03 §6), akun dengan security score rendah (dokumen 05 §5) secara agregat (bukan menampilkan skor personal per individu tanpa konteks — tetap hormati privasi, hanya agregat/anomali yang ditonjolkan).
- Tombol aksi cepat: force-logout semua sesi user tertentu (untuk kasus akun dicurigai diretas), reset 2FA (dengan verifikasi identitas tambahan sebelum admin bisa melakukannya).

---

## 8. Feature Flags

- `FeatureFlag` model (baru): key, enabled (global atau per-plan/per-user-segment), dipakai untuk rollout fitur baru bertahap (mis. aktifkan Widget Builder baru hanya untuk 10% user dulu) tanpa perlu deploy kode terpisah per rollout stage.
- Dicek lewat helper generik `useFeatureFlag(key)`/`isFeatureEnabled(key, user)` di server — satu titik implementasi, dipakai lintas fitur (dokumen 18).

---

## 9. Audit Logs (perluasan existing)

- Filter existing dipertahankan, ditambah filter per `AuditAction` baru (dokumen 04 §3: `BADGE_GRANT`, `MARKETPLACE_APPROVE`, dst).
- Setiap entri log menampilkan actor, target, aksi, alasan (jika ada), timestamp — dan tautan langsung ke entitas terkait (klik → buka profil user/listing yang dimaksud).

---

## 10. Role Boundary Admin Panel

Akses seluruh `/dashboard/admin/*` digerbang di level middleware (dokumen 05 §7) — `MODERATOR` mendapat akses terbatas (mis. hanya Reports & Moderation), `ADMIN`/`OWNER` akses penuh, dipetakan lewat permission matrix RBAC (dokumen 03 §8), bukan pengecekan role manual berulang di tiap halaman.

---

**Selanjutnya:** Dokumen **15 — API & Integrations** (integrasi eksternal, webhook, SDK publik, REST/GraphQL).
