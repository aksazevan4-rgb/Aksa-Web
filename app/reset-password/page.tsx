import { ArrowLeft, XCircle } from "lucide-react";
import Link from "next/link";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-grain">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-sm w-full">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Kembali ke halaman masuk
        </Link>

        <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
          Reset Password
        </h1>

        {token && email ? (
          <>
            <p className="text-text-secondary text-sm mb-8">
              Masukkan password baru untuk akunmu.
            </p>
            <ResetPasswordForm token={token} email={email.toLowerCase()} />
          </>
        ) : (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-2.5">
            <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              Tautan reset tidak valid. Minta tautan baru dari halaman{" "}
              <Link href="/forgot-password" className="text-purple hover:text-purple-glow">
                lupa password
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
