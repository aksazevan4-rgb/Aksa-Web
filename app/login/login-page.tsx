import { signIn } from "@/lib/auth";
import { GitBranch, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CredentialsLoginForm } from "@/app/login/credentials-form";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Login ditolak. Untuk masuk lewat Discord, email akun Discord-mu harus sudah terverifikasi terlebih dahulu (cek pengaturan akun di Discord, lalu verifikasi emailmu). Setelah itu coba login lagi.",
  OAuthAccountNotLinked:
    "Email ini sudah terdaftar dengan metode login lain. Silakan masuk menggunakan metode yang sama seperti sebelumnya.",
  Configuration:
    "Terjadi masalah pada konfigurasi server. Silakan coba lagi nanti.",
  Verification:
    "Tautan verifikasi sudah tidak valid atau kedaluwarsa.",
};

function getOAuthErrorMessage(error?: string): string | null {
  if (!error) return null;
  return (
    OAUTH_ERROR_MESSAGES[error] ??
    "Gagal masuk. Silakan coba lagi atau gunakan metode login lain."
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.073.035c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.07.07 0 0 0-.073-.035A19.736 19.736 0 0 0 3.677 4.37a.064.064 0 0 0-.03.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.955 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.419-2.157 2.419Z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.37l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const oauthError = getOAuthErrorMessage(error);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-grain relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full orb orb-purple opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full orb orb-pink opacity-20 blur-3xl"
      />
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-sm w-full relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Kembali ke halaman utama
        </Link>

        <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
          Masuk
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Masuk untuk mengakses dashboard dan fitur lainnya.
        </p>

        {oauthError && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {oauthError}
          </p>
        )}

        <CredentialsLoginForm />

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-text-tertiary uppercase tracking-wider">
            atau
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-white/5 border border-border px-4 py-3 text-sm font-medium text-text-primary hover:bg-white/10 hover:border-purple/40 transition-colors"
            >
              <GitBranch size={18} />
              Lanjutkan dengan GitHub
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 px-4 py-3 text-sm font-medium text-text-primary hover:bg-[#5865F2]/20 transition-colors"
            >
              <span className="text-[#5865F2]">
                <DiscordIcon />
              </span>
              Lanjutkan dengan Discord
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-white/5 border border-border px-4 py-3 text-sm font-medium text-text-primary hover:bg-white/10 hover:border-purple/40 transition-colors"
            >
              <GoogleIcon />
              Lanjutkan dengan Google
            </button>
          </form>
        </div>

        <p className="text-text-tertiary text-[11px] text-center mt-8 leading-relaxed">
          Dengan masuk, kamu menyetujui bahwa data profil dasar (nama, email,
          foto) akan disimpan untuk keperluan akun.
        </p>
      </div>
    </main>
  );
}