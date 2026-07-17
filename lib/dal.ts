import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

/**
 * Data Access Layer untuk autentikasi & otorisasi.
 *
 * PENTING: jangan andalkan app/dashboard/layout.tsx sebagai satu-satunya
 * tempat validasi. Next.js App Router melakukan "partial rendering" —
 * layout TIDAK selalu re-render saat navigasi antar halaman dalam route
 * segment yang sama, jadi validasi di layout saja bisa terlewat.
 *
 * Validasi harus dipanggil di setiap Page, Server Action, dan Route Handler
 * yang membutuhkan autentikasi.
 */



export const verifySession = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.sessionJti) {
    console.log("SESSION TIDAK ADA JTI");
    redirect("/login");
  }

  console.log("SESSION JTI:", session.sessionJti);

  const activeToken = await prisma.activeToken.findUnique({
    where: {
      jti: session.sessionJti,
    },
  });

  console.log("ACTIVE TOKEN:", activeToken);

  if (!activeToken) {
    console.log("TOKEN TIDAK DITEMUKAN");
    redirect("/login");
  }

  if (activeToken.revokedAt) {
    console.log("TOKEN SUDAH DICABUT");
    redirect("/login");
  }

  if (activeToken.expiresAt < new Date()) {
    console.log("TOKEN EXPIRED");
    redirect("/login");
  }

  return session;
});

/**
 * Memastikan user adalah ADMIN.
 */
export const verifyAdmin = cache(async () => {
  const session = await verifySession();

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
});

/**
 * Digunakan untuk Route Handler (app/api/**).
 */
export async function verifyAdminApi(): Promise<
  { session: Session; response?: undefined } |
  { session?: undefined; response: NextResponse }
> {
  const session = await auth();

  if (!session?.user) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  if (session.sessionJti) {
    const activeToken = await prisma.activeToken.findUnique({
      where: { jti: session.sessionJti },
      select: { revokedAt: true },
    });

    if (!activeToken || activeToken.revokedAt) {
      return {
        response: NextResponse.json(
          { error: "Sesi sudah tidak berlaku" },
          { status: 401 }
        ),
      };
    }
  }

  return { session };
}