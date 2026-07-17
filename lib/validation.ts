const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Aturan password: minimal 8 karakter, ada huruf besar, huruf kecil, dan
 * angka. Cukup ketat untuk dipakai publik, tapi tidak menyiksa UX dengan
 * wajib simbol.
 */
export function getPasswordError(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter.";
  if (!/[A-Z]/.test(password)) return "Password harus mengandung huruf besar.";
  if (!/[a-z]/.test(password)) return "Password harus mengandung huruf kecil.";
  if (!/[0-9]/.test(password)) return "Password harus mengandung angka.";
  return null;
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorClass: string;
};

/**
 * Simple, dependency-free strength score (0-4) for live feedback while
 * typing. This is presentational only — `getPasswordError` above remains
 * the actual enforced minimum requirement on submit.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "", colorClass: "bg-white/10" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const levels: Record<0 | 1 | 2 | 3 | 4, { label: string; colorClass: string }> = {
    0: { label: "Sangat lemah", colorClass: "bg-red-500" },
    1: { label: "Lemah", colorClass: "bg-red-500" },
    2: { label: "Cukup", colorClass: "bg-amber-400" },
    3: { label: "Kuat", colorClass: "bg-emerald-400" },
    4: { label: "Sangat kuat", colorClass: "bg-emerald-400" },
  };

  return { score: clamped, ...levels[clamped] };
}

export function sanitizeName(name: string): string {
  // Buang tag/karakter berbahaya dasar dari input nama. Prisma sudah
  // melindungi dari SQL injection lewat parameterized query, ini cuma
  // jaga-jaga supaya nama tidak menyimpan markup mentah.
  return name.replace(/[<>]/g, "").trim().slice(0, 100);
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,24}$/;
const RESERVED_USERNAMES = new Set([
  "admin",
  "root",
  "dashboard",
  "api",
  "login",
  "register",
  "settings",
  "profile",
  "aksa",
  "support",
  "help",
  "l",
  "links",
  "premium",
  "logout",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

/**
 * Validasi username publik: 3-24 karakter, hanya huruf/angka/underscore,
 * dan tidak boleh memakai kata yang sudah dipakai sebagai route/halaman
 * sistem (supaya tidak ada konflik URL di masa depan saat profil publik
 * per-user diaktifkan).
 */
export function getUsernameError(username: string): string | null {
  const trimmed = username.trim();
  if (!USERNAME_REGEX.test(trimmed)) {
    return "Username 3-24 karakter, hanya huruf, angka, dan underscore.";
  }
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return "Username ini sudah dipakai sistem, coba yang lain.";
  }
  return null;
}

export function sanitizeBio(bio: string): string {
  return bio.replace(/[<>]/g, "").trim().slice(0, 280);
}

/**
 * Memastikan URL social link aman ditampilkan sebagai href — hanya
 * http/https yang diizinkan (menolak skema seperti javascript: yang bisa
 * dipakai untuk XSS lewat link "Connect" di profil).
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validasi khusus untuk avatar/banner: hanya https yang diterima. next.config.ts
 * cuma mengizinkan remotePatterns berskema https (selain dua host OAuth), jadi
 * URL http akan gagal dimuat next/image dengan error mentah — lebih baik
 * ditolak di sini dengan pesan yang jelas daripada baru gagal saat dirender.
 */
export function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Tombol custom di profil publik (ala Linktree) butuh skema lebih fleksibel
 * daripada social link biasa — orang sering ingin tombol "Email" (mailto:)
 * atau "Telepon/WhatsApp" (tel:), bukan cuma http/https.
 */
export function isSafeLinkUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeLinkLabel(label: string): string {
  return label.replace(/[<>]/g, "").trim().slice(0, 40);
}

export function getProfileLinkError(label: string, url: string): string | null {
  const trimmedLabel = label.trim();
  if (trimmedLabel.length < 1) return "Label tombol tidak boleh kosong.";
  if (trimmedLabel.length > 40) return "Label tombol maksimal 40 karakter.";
  if (!url.trim()) return "URL tujuan tidak boleh kosong.";
  if (!isSafeLinkUrl(url.trim())) {
    return "URL harus diawali http://, https://, mailto:, atau tel:.";
  }
  return null;
}
