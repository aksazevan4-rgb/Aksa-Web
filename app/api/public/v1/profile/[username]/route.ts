import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiKeyService } from "@/features/api-keys/server/service";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * app/api/public/v1/profile/[username]/route.ts
 *
 * docs/15-api-integrations.md §2 — endpoint publik pertama untuk developer
 * pihak ketiga. Autentikasi via header `Authorization: Bearer {apiKey}`,
 * bukan session cookie (docs/15 §2: "cocok untuk server-to-server").
 *
 * Response format konsisten `{ data, meta, error }` (docs/15 §2) supaya
 * versi API berikutnya (kalau ada breaking change) tidak mengejutkan
 * konsumen yang sudah pegang bentuk response ini.
 */

function jsonError(status: number, message: string) {
  return NextResponse.json({ data: null, meta: null, error: message }, { status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return jsonError(401, "Missing Authorization: Bearer {api_key} header.");
  }

  const auth = await apiKeyService.verifyToken(token);
  if (!auth) {
    return jsonError(401, "API key tidak valid atau sudah dicabut.");
  }

  // Rate limit per API key (docs/15 §6) — lebih ketat dibanding dashboard
  // internal karena ini endpoint publik yang bisa dipanggil server-to-server
  // tanpa batasan UI. lib/rate-limit.ts (in-memory, best-effort per instance
  // — lihat catatan di file itu soal keterbatasan di Vercel serverless).
  const rl = checkRateLimit(`public_api:${auth.keyId}`, { windowMs: 60_000, max: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { data: null, meta: null, error: "Rate limit exceeded. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
    );
  }

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      username: true,
      name: true,
      bio: true,
      image: true,
      profileVisibility: true,
      accountStatus: true,
      profileViews: true,
      links: {
        where: {
          visible: true,
          AND: [
            { OR: [{ scheduledStart: null }, { scheduledStart: { lte: new Date() } }] },
            { OR: [{ scheduledEnd: null }, { scheduledEnd: { gte: new Date() } }] },
          ],
        },
        orderBy: { order: "asc" },
        select: { label: true, url: true, icon: true },
      },
    },
  });

  if (!user || user.profileVisibility !== "PUBLIC" || user.accountStatus !== "ACTIVE") {
    return jsonError(404, "Profil tidak ditemukan atau tidak publik.");
  }

  return NextResponse.json({
    data: {
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.image,
      profileViews: user.profileViews,
      links: user.links,
    },
    meta: { version: "v1" },
    error: null,
  });
}
