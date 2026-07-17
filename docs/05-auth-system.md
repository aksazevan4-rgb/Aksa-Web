# 05 — Authentication System
## AKSA AboutMe

> Dibangun di atas **NextAuth/Auth.js** yang sudah terpasang (`app/api/auth/[...nextauth]/route.ts`, model `Account`/`Session`/`VerificationToken` sudah ada di schema). Dokumen ini merinci perluasan yang dibutuhkan: 2FA, device management, security score — bukan mengganti fondasi auth yang sudah berjalan.

---

## 1. Provider yang Didukung

| Provider | Status | Catatan |
|---|---|---|
| Credentials (email + password) | Sudah ada | Tetap dipakai, diperkuat dengan rate limit + password strength meter (sudah ada `PasswordStrengthMeter.tsx`) |
| Discord OAuth | Sudah ada (`discordId`, `discordLinked` di model User) | Prioritas tinggi karena target komunitas |
| Google OAuth | Baru | Ditambahkan sebagai provider NextAuth standar |
| GitHub OAuth | Baru | Relevan untuk persona developer |
| Apple OAuth | Baru (opsional fase lanjutan) | Kompleksitas setup lebih tinggi, bisa ditunda ke fase pengerasan produk |
| Magic Link (email) | Baru | Alternatif tanpa password, memakai Resend (sudah dependency) |

Semua provider tambahan memakai adapter yang sama (`@auth/prisma-adapter`, sudah terpasang) — tidak perlu tabel baru selain `Account` yang sudah mendukung multi-provider per user.

---

## 2. Two-Factor Authentication (2FA)

- Metode: TOTP (Time-based One-Time Password), kompatibel dengan Google Authenticator/Authy — tidak bergantung SMS (menghindari biaya & risiko SIM-swap).
- Alur aktivasi: Settings → Security → "Aktifkan 2FA" → tampilkan QR code (server generate secret) → user scan → konfirmasi 1 kode → simpan secret terenkripsi + tampilkan **Recovery Codes** (10 kode sekali pakai, di-hash sebelum disimpan, ditampilkan hanya sekali).
- Login flow dengan 2FA aktif: credentials valid → redirect ke step verifikasi TOTP sebelum session dibuat penuh (bukan session penuh lalu diverifikasi belakangan).
- Recovery Code dipakai untuk kondisi kehilangan device authenticator — setiap kode sekali pakai, otomatis expired setelah dipakai.

---

## 3. Session & Device Management

Model `Session` (existing) diperluas secara logis (tanpa mengubah struktur inti) dengan tracking device via `LoginEvent` (existing) yang sudah mencatat IP/waktu login:

- **Active Sessions panel** (Settings → Security → Sessions): daftar semua session aktif dengan info device (parsed dari user-agent), lokasi kasar (dari IP, tanpa menyimpan data lokasi presisi demi privasi), waktu terakhir aktif.
- **Revoke session** — user bisa logout paksa session lain (mis. laptop yang hilang) tanpa mengubah password.
- **Trusted Devices** — device yang sudah lolos 2FA sekali bisa ditandai "percaya perangkat ini selama 30 hari", mengurangi friksi 2FA berulang tanpa mengorbankan keamanan penuh.

---

## 4. Password & Recovery

- Reset password (sudah ada `forgot-password`, `reset-password` routes) tetap dipertahankan, diperkuat rate-limit ketat (dokumen 03 §6) untuk mencegah abuse.
- Password baru divalidasi lewat Zod schema bersama (`shared/validation/password.ts`) — dipakai konsisten di register, reset, dan change-password, dengan aturan sama persis (bukan aturan berbeda-beda per form seperti risiko pada implementasi ad-hoc).
- Email verification (sudah ada `verify-email`, `confirm-email-change` routes) tetap dipertahankan sebagai gate sebelum fitur sensitif (ubah email, hapus akun) bisa dilakukan.

---

## 5. Security Score

Skor komposit 0–100 ditampilkan di Settings → Security, dihitung dari faktor:

| Faktor | Bobot |
|---|---|
| 2FA aktif | 30 |
| Password diganti dalam 6 bulan terakhir | 15 |
| Email terverifikasi | 15 |
| Tidak ada session asing mencurigakan aktif | 20 |
| OAuth terhubung (mengurangi ketergantungan password tunggal) | 10 |
| Recovery codes belum habis terpakai | 10 |

Skor ini murni indikator edukatif untuk pengguna — **tidak dipakai sebagai gate fitur** (tidak menghukum pengguna dengan skor rendah, hanya mendorong lewat UI nudge yang ramah, sesuai filosofi UX dokumen 00 §7).

---

## 6. Onboarding & Session Bootstrap

- Flow existing (`app/onboarding/OnboardingClient.tsx`, field `onboardingCompleted`/`profileType` di model User) tetap dipertahankan sebagai langkah setelah register/first-login.
- Setelah OAuth pertama kali (mis. Discord), username disarankan otomatis dari `discordUsername` tapi tetap wajib dikonfirmasi/diedit user sebelum profil publik aktif (mencegah username otomatis yang tidak diinginkan).

---

## 7. RBAC Terkait Auth

Role (`Role` enum existing: dst) dan `AccountStatus` (existing) dipakai sebagai gate di level middleware Next.js (`proxy.ts`/middleware) untuk rute `/dashboard/admin/*` — hanya `ADMIN`/`OWNER` yang lolos, dicek di server bukan hanya disembunyikan di UI client (mencegah akses langsung via URL).

---

## 8. Ancaman & Mitigasi (ringkas)

| Ancaman | Mitigasi |
|---|---|
| Brute force login | Rate limit (dokumen 03 §6) + lockout sementara setelah N percobaan gagal beruntun |
| Session hijacking | Cookie `httpOnly` + `secure` + `sameSite=lax` (default NextAuth), rotasi session token saat privilege berubah (mis. setelah aktifkan 2FA) |
| Account takeover via email lama | Wajib re-verifikasi email saat mengganti alamat (`confirm-email-change` sudah ada) |
| Credential stuffing | Password strength meter + cek terhadap pola password umum di client sebelum submit, plus rate limit server |

---

**Selanjutnya:** Dokumen **06 — Dashboard System** (Overview, Analytics, navigasi, Command Palette, Quick Actions).
