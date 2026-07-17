/**
 * Rate limiter sederhana berbasis memori. Awalnya dibuat untuk percobaan
 * login, sekarang juga dipakai untuk endpoint publik lain (contact form,
 * profile view tracking) dengan window/limit masing-masing.
 *
 * CATATAN PENTING UNTUK DEPLOY DI VERCEL:
 * Ini hanya efektif penuh di satu instance/proses (misalnya saat development
 * atau di server long-running). Di Vercel, setiap request serverless bisa
 * dilayani oleh instance yang berbeda, sehingga Map ini TIDAK dibagi antar
 * instance — pembatasan jadi "best effort", bukan garansi keras. Untuk
 * proteksi brute-force yang benar-benar konsisten di production serverless,
 * upgrade ke store terpusat (mis. Upstash Redis) nanti. Untuk sekarang ini
 * sudah jauh lebih baik daripada tanpa rate limit sama sekali.
 */

type Entry = { count: number; resetAt: number };

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const DEFAULT_MAX_ATTEMPTS = 5;

const attempts = new Map<string, Entry>();

// Cegah Map tumbuh tanpa batas dari key sekali-pakai (mis. per-IP) yang
// tidak pernah di-reset — bersihkan entry kedaluwarsa setiap kali dipanggil.
function pruneExpired(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(key);
  }
}

export interface RateLimitOptions {
  /** Panjang jendela waktu dalam ms. Default: 15 menit (perilaku lama). */
  windowMs?: number;
  /** Jumlah maksimum percobaan dalam satu jendela. Default: 5 (perilaku lama). */
  max?: number;
}

export function checkRateLimit(
  key: string,
  options?: RateLimitOptions
): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = options?.max ?? DEFAULT_MAX_ATTEMPTS;

  const now = Date.now();
  if (attempts.size > 5000) pruneExpired(now);

  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}

/**
 * Ekstrak IP klien dari header standar proxy (x-forwarded-for / x-real-ip).
 * Menerima objek apa pun yang punya `.get()` seperti Headers biasa —
 * jadi bisa dipakai baik dari Route Handler (`req.headers`) maupun dari
 * Server Component (`await headers()` dari next/headers).
 */
export function getClientIp(headers: { get(name: string): string | null }): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip");
}
