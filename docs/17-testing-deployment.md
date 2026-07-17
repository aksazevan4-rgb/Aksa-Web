# 17 — Testing & Deployment
## AKSA AboutMe

---

## 1. Piramida Testing

```
        ▲  E2E (Playwright) — alur kritis end-to-end
       ───
      ▲▲▲  Integration — Server Action + repository + DB test (Vitest)
     ─────
    ▲▲▲▲▲  Unit — fungsi murni, validasi Zod, utility (Vitest)
```

Semakin ke atas piramida, semakin sedikit jumlah test tapi semakin luas cakupan alur nyata — mencegah biaya maintenance test yang terlalu berat di lapisan E2E.

---

## 2. Unit Test

- Target: fungsi murni di `service.ts` tiap fitur, schema Zod (`validation.ts`), utility di `shared/lib/`.
- Tool: **Vitest** (ringan, cepat, kompatibel ekosistem Vite/Next).
- Aturan: setiap Server Action baru minimal punya test untuk service layer-nya (business logic), bukan hanya test manual di browser.

---

## 3. Integration Test

- Target: Server Action penuh (auth → validasi → service → repository → DB) memakai database test terpisah (schema sama, data kosong per run, memakai `prisma migrate deploy` ke DB test sebelum suite jalan).
- Fokus pada domain kritis: Link CRUD, Badge unlock evaluator, Premium gate check, RBAC permission check.

---

## 4. E2E Test (Playwright)

Alur kritis yang wajib punya E2E:

1. Register → verifikasi email → onboarding → dashboard.
2. Login → tambah link → publish → cek muncul di halaman publik.
3. Login → buka Theme Builder → ubah warna → publish → cek berubah di halaman publik.
4. Alur upgrade premium (sandbox payment gateway) → fitur premium ter-unlock.
5. Admin: grant badge ke user → user melihat badge baru + notifikasi.

E2E dijalankan di browser headless sebagai bagian CI, dan dijadwalkan juga berkala di lingkungan staging (bukan hanya saat PR) untuk menangkap regresi dari perubahan infrastruktur/dependency.

---

## 5. CI/CD Pipeline

```
Push/PR → 
  1. npm run lint 
  2. tsc --noEmit (typecheck) 
  3. prisma validate + prisma generate 
  4. Unit + Integration test 
  5. next build 
  6. (opsional) Bundle size check, Lighthouse CI 
  7. E2E test (Playwright) di preview deployment
→ Merge diizinkan hanya jika semua tahap hijau
```

Ini adalah implementasi konkret dari perintah `npm run check` (sudah ada di `package.json` existing: `tsc --noEmit && eslint . && prisma validate && prisma generate && next build`) — CI menjalankan urutan yang sama plus lapisan test.

---

## 6. Docker & Environment

- `Dockerfile` multi-stage (build stage terpisah dari runtime stage) untuk image produksi yang ramping.
- Environment terpisah jelas: `development`, `staging`, `production` — masing-masing `DATABASE_URL`/`DIRECT_URL` (existing di `.env.example`) dan Redis instance sendiri, tidak pernah berbagi database staging dengan produksi.
- Background worker (dokumen 03 §4) dijalankan sebagai service/container terpisah dari Next.js server utama, bukan proses tambahan di dalam request handler.

---

## 7. Monitoring Produksi

- Error tracking terpusat (dokumen 03 §9) dengan alert untuk error rate melebihi threshold.
- Health check endpoint (`/api/health` — baru) dipakai load balancer/orchestrator untuk deteksi instance yang tidak sehat.
- Log terstruktur dikirim ke satu tempat agregasi (bukan tersebar per instance), memudahkan debugging insiden produksi.

---

## 8. Backup & Disaster Recovery

- Backup database otomatis harian (dokumen 04 §7), diuji restore-nya secara berkala (bukan hanya diasumsikan bekerja) — minimal simulasi restore ke lingkungan staging tiap beberapa bulan.
- Rencana rollback: setiap deployment produksi bisa di-rollback ke versi image sebelumnya dengan cepat jika terjadi masalah kritis pasca-rilis.

---

## 9. Release Process

1. Merge ke `main` setelah CI hijau penuh.
2. Deploy otomatis ke staging → smoke test manual singkat untuk fitur besar yang baru dirilis.
3. Promote ke production (manual gate untuk rilis besar, otomatis untuk patch kecil — kebijakan detail ditentukan tim saat implementasi).
4. Update `CHANGELOG.md`/`CHANGELOG-N.md` (pola existing) setiap rilis, dan entri Changelog in-app (dokumen 06 §8) untuk pengguna.

---

**Selanjutnya:** Dokumen **18 — Development Rules** (aturan kode wajib, larangan duplikasi, proses refactor aman).
