import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RegisterForm } from "@/app/register/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-grain relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full orb orb-pink opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full orb orb-purple opacity-20 blur-3xl"
      />
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-sm w-full relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Kembali ke halaman masuk
        </Link>

        <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
          Daftar
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Buat akun baru untuk mengakses dashboard.
        </p>

        <RegisterForm />

        <p className="text-text-tertiary text-[11px] text-center mt-8 leading-relaxed">
          Dengan mendaftar, kamu menyetujui bahwa data profil dasar (nama,
          email) akan disimpan untuk keperluan akun.
        </p>
      </div>
    </main>
  );
}
