# 15 — API & Integrations
## AKSA AboutMe

> Basis existing: webhook Discord bot (`app/api/discord/bot/webhook/route.ts`), Discord presence (`app/api/discord/presence/route.ts`), integrasi Cloudinary untuk media. Dokumen ini merapikan pola integrasi eksternal dan mendefinisikan API publik untuk developer.

---

## 1. Integrasi Pihak Ketiga (Consumer Side — AKSA memanggil layanan luar)

| Layanan | Pemakaian | Pola Auth |
|---|---|---|
| Discord | OAuth login, presence bot webhook (existing) | Bot token (server-side only), OAuth user token (NextAuth) |
| Spotify | Now-playing widget (dokumen 09/11) | OAuth scope tambahan, refresh token disimpan terenkripsi |
| GitHub | OAuth login, contribution graph widget | OAuth (NextAuth), token read-only public data |
| Steam | Status widget | OpenID (Steam tidak pakai OAuth standar) |
| Twitch/YouTube/TikTok | Live status / latest video widget | API key publik masing-masing platform, polling ringan + cache Redis (dokumen 03 §3) |
| Stripe | Billing (dokumen 12) | Webhook signature verification wajib di setiap event masuk |
| Resend | Email transaksional (existing) | API key server-side |
| Cloudinary | Media upload/hosting (existing) | Signed upload preset, tidak expose secret ke client |

**Aturan wajib semua integrasi:** kredensial pihak ketiga hanya hidup di server (env var), tidak pernah dikirim ke client; setiap webhook masuk diverifikasi signature/secret sebelum diproses; kegagalan satu integrasi tidak boleh menjatuhkan halaman (fallback graceful — dokumen 02 §7).

---

## 2. Public API AKSA (Provider Side — developer luar memanggil AKSA)

Untuk pengguna yang ingin integrasi kustom (mis. menampilkan data profil AKSA di website lain):

```
GET  /api/public/v1/profile/{username}       → data profil publik (respect visibility)
GET  /api/public/v1/profile/{username}/links → daftar link publik
POST /api/public/v1/webhooks/subscribe        → daftar webhook (badge unlocked, link clicked)
```

- Autentikasi via **API Key** (dibuat di Settings → API, dokumen 14/06 sidebar "API"), bukan session cookie — cocok untuk server-to-server.
- Rate limit lebih ketat untuk API publik dibanding dashboard internal (dokumen 03 §6), dengan tier berbeda per plan (FREE: rate rendah, PREMIUM: lebih tinggi).
- Response mengikuti format konsisten `{ data, meta, error }`, versi API di path (`/v1/`) untuk menjamin kompatibilitas mundur saat ada perubahan besar.

---

## 3. Webhook Keluar (AKSA → Developer)

- Event yang bisa disubscribe: `badge.unlocked`, `link.clicked` (agregat, bukan per-klik individual demi privasi pengunjung), `premium.activated`.
- Payload ditandatangani (HMAC signature di header) agar penerima bisa verifikasi keasliannya — sama seperti pola Stripe webhook yang sudah familiar bagi developer.
- Retry dengan backoff untuk webhook yang gagal terkirim (maks beberapa kali percobaan), lalu dinonaktifkan otomatis + notifikasi ke pemilik API key jika terus gagal.

---

## 4. SDK Halaman "Developer"

- Halaman dashboard "Developer" (sidebar §1 dokumen 06) menyediakan: API key management, dokumentasi interaktif (contoh request/response), webhook log (riwayat pengiriman + status, untuk debugging developer sendiri).
- Contoh kode snippet (curl, JS fetch) di-generate otomatis dari definisi endpoint yang sama (satu sumber kebenaran skema API, bukan dokumentasi yang ditulis manual terpisah dan rawan usang).

---

## 5. GraphQL (Opsional, Fase Lanjutan)

- REST (`/api/public/v1/*`) adalah prioritas rilis awal karena lebih sederhana untuk kasus pemakaian yang ada.
- Endpoint GraphQL dipertimbangkan hanya jika ada kebutuhan nyata query fleksibel dari developer pihak ketiga — dicatat sebagai opsi masa depan, bukan komitmen wajib, untuk menghindari over-engineering di awal (selaras prinsip dokumen 02 §3).

---

## 6. Keamanan Integrasi

- Semua endpoint publik (`/api/public/v1/*`) melalui rate limiting (dokumen 03 §6) dan validasi Zod input.
- CORS dikonfigurasi eksplisit per endpoint publik (whitelist, bukan `*` terbuka) untuk endpoint yang dipanggil dari browser pihak ketiga.
- API key bisa di-revoke kapan saja oleh pemiliknya, dan otomatis dicatat di Audit Log saat dibuat/dihapus.

---

**Selanjutnya:** Dokumen **16 — Performance & Security** (caching strategy, Core Web Vitals, hardening keamanan).
