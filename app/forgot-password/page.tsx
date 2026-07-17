import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";

export default function ForgotPasswordPage() {
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
          Lupa Password
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Masukkan email akunmu, kami akan kirimkan tautan untuk mereset
          password.
        </p>

        <ForgotPasswordForm />
      </div>
    </main>
  );
}
