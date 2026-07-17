import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { consumeToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { AuditAction } from "@prisma/client";

export const dynamic = "force-dynamic";

async function verify(token: string, email: string): Promise<boolean> {
  const valid = await consumeToken(TOKEN_PURPOSE.EMAIL_VERIFY, email, token);
  if (!valid) return false;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: AuditAction.EMAIL_VERIFIED,
      entityType: "User",
      entityId: user.id,
      metadata: { email },
    },
  });

  return true;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  const success =
    token && email ? await verify(token, email.toLowerCase()) : false;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-grain">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center">
        {success ? (
          <>
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
              Email terverifikasi
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              Emailmu berhasil diverifikasi. Sekarang kamu bisa menggunakan
              semua fitur akun sepenuhnya.
            </p>
          </>
        ) : (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
              Tautan tidak valid
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              Tautan verifikasi sudah kedaluwarsa atau tidak valid. Kamu bisa
              meminta tautan baru dari halaman pengaturan akun.
            </p>
          </>
        )}

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple hover:bg-purple-dim px-4 py-3 text-sm font-medium text-white transition-colors w-full"
        >
          <ArrowLeft size={16} />
          Ke Dashboard
        </Link>
      </div>
    </main>
  );
}
