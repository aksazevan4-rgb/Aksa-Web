# 03 — Backend Architecture
## AKSA AboutMe

---

## 1. Prinsip

1. **Server Actions sebagai lapisan utama**, Route Handlers (`app/api/*`) dipakai hanya untuk: webhook eksternal (Discord bot, Stripe), endpoint yang dikonsumsi non-browser (public API dokumen 15), dan streaming response (OG image, redirect link `app/l/[id]`).
2. **Repository/Service layer wajib** antara Server Action dan Prisma — Server Action tidak pernah memanggil `prisma.*` langsung.
3. **Semua mutasi diaudit** — perubahan pada data sensitif (role, plan, badge) tercatat ke Audit Log (dokumen 04).

---

## 2. Layer Structure

```
features/links/server/
├── actions.ts        # "use server" — entrypoint dari client, validasi + auth + permission
├── service.ts         # business logic murni (testable, tanpa "use server")
└── repository.ts      # satu-satunya file yang bicara ke Prisma untuk domain "links"
```

Alur satu request: `Client → Server Action (validasi+auth) → Service (business rule) → Repository (Prisma) → Redis cache invalidation → revalidatePath`.

---

## 3. Redis — Pemakaian Konkret

| Kunci Cache | TTL | Alasan |
|---|---|---|
| `profile:{username}:public` | 60s | Halaman publik diakses tinggi, data jarang berubah per menit |
| `analytics:{userId}:summary` | 5 menit | Agregasi berat, tidak perlu real-time detik |
| `badge:progress:{userId}` | invalidate on write | Dihitung ulang saat ada event (link click, login streak) |
| `ratelimit:{ip}:{route}` | sliding window 60s | Rate limiting (lihat §6) |
| `session:presence:{userId}` | 30s | Status online untuk sidebar/public profile |

Redis **bukan** sumber kebenaran — selalu ada fallback ke Postgres jika cache miss/kosong.

---

## 4. Background Jobs & Scheduler

Kebutuhan job terjadwal (bukan real-time):

- **Expire link checker** — jalan tiap 5 menit, set link nonaktif otomatis saat `expireAt` terlewati.
- **Scheduled publish** — aktifkan link/tema yang dijadwalkan pada waktunya.
- **Badge requirement evaluator** — evaluasi progress badge berbasis event (bukan polling penuh setiap saat, dipicu oleh event significant: new follower count milestone, dsb).
- **Analytics rollup harian** — agregasi page view/link click mentah menjadi ringkasan harian tersimpan, mengurangi beban query analytics dashboard.

Implementasi: queue ringan berbasis Redis (BullMQ atau setara) + satu worker process terpisah dari Next.js server, dijalankan lewat proses Node terpisah di deployment (detail deployment di dokumen 17).

---

## 5. Notification System

- **Trigger** (server-side): mutasi tertentu (badge unlock, komentar guestbook baru, premium expiring soon) menulis ke tabel `Notification` + publish event Redis Pub/Sub.
- **Delivery in-app:** `NotificationBell`/`NotificationCenter` (sudah ada di codebase) di-subscribe via React Query polling ringan (interval pendek) — upgrade opsional ke SSE/WebSocket dipertimbangkan di fase optimasi lanjutan, bukan wajib di rilis awal.
- **Delivery email:** dikirim via Resend (sudah dependency project) untuk notifikasi penting (security alert, invoice, premium expiring).

---

## 6. Rate Limiting

- Berbasis Redis sliding-window per kombinasi `ip + route` dan `userId + route` (mana yang lebih ketat yang berlaku).
- Endpoint sensitif (login, register, forgot-password, contact form, redirect link publik) wajib rate-limited lebih ketat dibanding endpoint dashboard internal.
- Response saat limit tercapai: HTTP 429 + pesan jelas + `Retry-After` header, ditampilkan di UI sebagai toast informatif (bukan error generik).

---

## 7. Validation Layer

- **Zod sebagai satu-satunya sumber validasi**, schema didefinisikan sekali per domain di `features/{domain}/validation.ts`, direuse baik di Server Action maupun React Hook Form resolver (client) — mencegah duplikasi aturan validasi client vs server.
- Validasi server **tidak boleh** hanya mengandalkan validasi client — setiap Server Action re-validasi input dari nol.

---

## 8. RBAC & Permission

Model permission sederhana namun tegas:

```
Role:  USER | MODERATOR | ADMIN | OWNER
Permission string: "{domain}:{action}"  contoh: "badges:assign", "users:ban", "content:publish"
```

- Middleware `requirePermission(session, permission)` dipanggil di setiap Server Action/route yang mengubah data lintas-user (admin actions).
- Permission matrix per role didefinisikan satu tempat (`shared/lib/rbac.ts`), tidak diperiksa manual per file (mencegah inkonsistensi aturan akses).

---

## 9. Logging & Observability

- Structured logging (JSON) untuk Server Actions penting: siapa, aksi apa, target apa, hasil apa, timestamp — dasar untuk Audit Log dokumen 04.
- Error tak tertangani di Server Action ditangkap terpusat, dikirim ke satu error reporting channel (opsi: Sentry — ditambahkan sebagai dependency saat implementasi), bukan hanya `console.error`.

---

## 10. Analytics Pipeline (Backend Side)

Event mentah yang dicatat: `profile_view`, `link_click`, `qr_scan`, `widget_interact`. Alur:

```
Event terjadi → tulis ke tabel Event (append-only) → job rollup harian (§4) → tabel Summary
```

Dashboard analytics (dokumen 06) membaca dari tabel `Summary` untuk rentang lama, dan dari cache Redis (§3) untuk angka real-time hari berjalan — bukan agregasi live dari tabel Event mentah setiap kali halaman dibuka (mahal & lambat).

---

**Selanjutnya:** Dokumen **04 — Database Design** (Prisma schema, ERD, migration strategy, audit log, soft delete).
