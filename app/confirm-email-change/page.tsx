import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { consumeToken, TOKEN_PURPOSE } from "@/lib/tokens";
import { AuditAction } from "@prisma/client";

export const dynamic = "force-dynamic";

async function confirmChange(uid: string, newEmail: string, token: string): Promise<string | null> {
  const key = `${uid}:${newEmail}`;
  const valid = await consumeToken(TOKEN_PURPOSE.EMAIL_CHANGE, key, token);
  if (!valid) return null;

  const stillAvailable = await prisma.user.findUnique({ where: { email: newEmail } });
  if (stillAvailable) return null; // diambil orang lain di antara request & konfirmasi

  const user = await prisma.user.update({
    where: { id: uid },
    data: { email: newEmail, emailVerified: new Date() },
  }).catch(() => null);

  if (!user) return null;

  await prisma.auditLog.create({
    data: {
      actorId: uid,
      action: AuditAction.EMAIL_CHANGE_COMPLETE,
      entityType: "User",
      entityId: uid,
      metadata: { newEmail },
    },
  });

  return newEmail;
}

export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; uid?: string; email?: string }>;
}) {
  const { token, uid, email } = await searchParams;

  const confirmedEmail =
    token && uid && email ? await confirmChange(uid, email.toLowerCase(), token) : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-grain">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center">
        {confirmedEmail ? (
          <>
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
              Email berhasil diganti
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              Email akunmu sekarang <strong>{confirmedEmail}</strong>. Gunakan
              email ini untuk login berikutnya.
            </p>
          </>
        ) : (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h1 className="font-display font-semibold text-xl text-text-primary mb-2">
              Tautan tidak valid
            </h1>
            <p className="text-text-secondary text-sm mb-8">
              Tautan konfirmasi sudah kedaluwarsa, tidak valid, atau email
              tersebut sudah dipakai akun lain. Coba minta ganti email lagi
              dari halaman pengaturan.
            </p>
          </>
        )}

        <Link
          href="/dashboard/settings"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple hover:bg-purple-dim px-4 py-3 text-sm font-medium text-white transition-colors w-full"
        >
          Ke Pengaturan
        </Link>
      </div>
    </main>
  );
}
