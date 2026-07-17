import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Semua tombol custom link di profil publik (/[username]) mengarah ke
 * /l/[id] dulu, BUKAN langsung ke URL tujuan — supaya klik bisa dihitung
 * di server (statistik "jumlah klik" per tombol) sebelum redirect 302 ke
 * URL aslinya. Pendekatan ini tidak butuh JavaScript di sisi klien sama
 * sekali, jadi tetap akurat walau pengunjung mematikan JS atau langsung
 * membuka link di tab baru.
 *
 * Fase 3 menambah dua pengecekan sebelum redirect terjadi:
 * - Jadwal (scheduledStart/scheduledEnd): link di luar jendela waktu
 *   dianggap belum/tidak lagi aktif, sama seperti visible=false.
 * - Password (passwordHash): kalau diset, pengunjung harus mengisi
 *   password dulu di halaman gate sebelum di-redirect. Diverifikasi di
 *   server (POST di bawah), password asli tidak pernah dikirim ke client.
 */

const SELECT = {
  url: true,
  visible: true,
  passwordHash: true,
  scheduledStart: true,
  scheduledEnd: true,
  // Fase 4 (docs/08-link-management.md §3 Behavior, §8 Advanced)
  expireAt: true,
  geoRestriction: true,
  utmParams: true,
  user: { select: { accountStatus: true } },
} as const;

function isWithinSchedule(
  scheduledStart: Date | null,
  scheduledEnd: Date | null
): boolean {
  const now = new Date();
  if (scheduledStart && now < scheduledStart) return false;
  if (scheduledEnd && now > scheduledEnd) return false;
  return true;
}

/** docs/08 §3 (Behavior tab, Expiration Date) — dieksekusi di sini sebagai
 * pengecekan on-read; job terjadwal terpisah (docs/03 §4) yang menonaktifkan
 * `visible` secara massal adalah optimisasi lanjutan, bukan pengganti. */
function isExpired(expireAt: Date | null): boolean {
  return Boolean(expireAt && new Date() > expireAt);
}

type GeoRestriction = { mode: "allow" | "block"; countries: string[] } | null;

/** docs/08 §3 (Advanced tab, GEO Restriction). "Fail open" dengan sengaja:
 * kalau header negara tidak tersedia (mis. dev lokal, host tanpa header
 * geo), link tetap dibuka — GEO restriction tidak boleh mengunci semua
 * pengunjung hanya karena data lokasi kebetulan tidak terbaca. */
function isGeoAllowed(geoRestriction: GeoRestriction, req: NextRequest): boolean {
  if (!geoRestriction) return true;
  const country = req.headers.get("x-vercel-ip-country");
  if (!country) return true;

  const inList = geoRestriction.countries.includes(country.toUpperCase());
  return geoRestriction.mode === "allow" ? inList : !inList;
}

type UtmParams = { source?: string; medium?: string; campaign?: string } | null;

/** docs/08 §3 (Behavior tab, UTM Tracking) — parameter di-append ke URL
 * tujuan, tidak menimpa parameter UTM yang mungkin sudah ada di URL asli. */
function buildDestinationUrl(rawUrl: string, utmParams: UtmParams): string {
  if (!utmParams) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (utmParams.source && !url.searchParams.has("utm_source")) {
      url.searchParams.set("utm_source", utmParams.source);
    }
    if (utmParams.medium && !url.searchParams.has("utm_medium")) {
      url.searchParams.set("utm_medium", utmParams.medium);
    }
    if (utmParams.campaign && !url.searchParams.has("utm_campaign")) {
      url.searchParams.set("utm_campaign", utmParams.campaign);
    }
    return url.toString();
  } catch {
    // URL tujuan tidak valid untuk di-parse (seharusnya jarang terjadi,
    // sudah divalidasi saat disimpan) — fallback ke url asli apa adanya.
    return rawUrl;
  }
}

function passwordGateHtml(id: string, error?: string) {
  // Minimal, dependency-free HTML — halaman ini sengaja tidak memakai
  // layout/Tailwind app utama (link publik bisa diakses tanpa sesi apa
  // pun, dan tidak perlu menarik seluruh bundel dashboard).
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Link Terkunci</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#07070f; color:#eaeaf6; font-family:ui-sans-serif,system-ui,sans-serif; }
  .card { background:#0e0e1a; border:1px solid #1e1e36; border-radius:20px; padding:32px; width:100%; max-width:360px; text-align:center; }
  .icon { width:44px; height:44px; border-radius:9999px; background:rgba(155,109,255,0.12); border:1px solid rgba(155,109,255,0.25);
    display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#9b6dff; font-size:20px; }
  h1 { font-size:16px; margin:0 0 6px; }
  p { font-size:13px; color:#8a8aaa; margin:0 0 20px; }
  input { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid #1e1e36; border-radius:12px;
    padding:10px 14px; color:#eaeaf6; font-size:14px; margin-bottom:12px; }
  button { width:100%; background:#9b6dff; color:#fff; border:none; border-radius:12px; padding:11px 14px; font-size:14px; font-weight:600; cursor:pointer; }
  button:hover { background:#7c4fe0; }
  .err { color:#f87171; font-size:12px; margin-bottom:12px; }
</style>
</head>
<body>
  <div class="card">
    <div class="icon">&#128274;</div>
    <h1>Link ini dilindungi password</h1>
    <p>Masukkan password yang diberikan pemilik profil untuk melanjutkan.</p>
    ${error ? `<div class="err">${error}</div>` : ""}
    <form method="POST" action="/l/${id}">
      <input type="password" name="password" placeholder="Password" autofocus required />
      <button type="submit">Buka Link</button>
    </form>
  </div>
</body>
</html>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const link = await prisma.profileLink.findUnique({ where: { id }, select: SELECT });

  if (
    !link ||
    !link.visible ||
    link.user?.accountStatus !== "ACTIVE" ||
    !isWithinSchedule(link.scheduledStart, link.scheduledEnd) ||
    isExpired(link.expireAt) ||
    !isGeoAllowed(link.geoRestriction as GeoRestriction, req)
  ) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  if (link.passwordHash) {
    return new NextResponse(passwordGateHtml(id), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    await prisma.profileLink.update({ where: { id }, data: { clicks: { increment: 1 } } });
  } catch (error) {
    // Best-effort — kalau gagal mencatat klik, jangan sampai memblokir
    // pengunjung dari tujuan link.
    console.error("[PROFILE_LINK_CLICK_ERROR]", error);
  }

  return NextResponse.redirect(buildDestinationUrl(link.url, link.utmParams as UtmParams), { status: 302 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const link = await prisma.profileLink.findUnique({ where: { id }, select: SELECT });

  if (
    !link ||
    !link.visible ||
    link.user?.accountStatus !== "ACTIVE" ||
    !isWithinSchedule(link.scheduledStart, link.scheduledEnd) ||
    isExpired(link.expireAt) ||
    !isGeoAllowed(link.geoRestriction as GeoRestriction, req)
  ) {
    return NextResponse.redirect(new URL("/", req.url), { status: 302 });
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  const valid = link.passwordHash
    ? await bcrypt.compare(password, link.passwordHash)
    : true;

  if (!valid) {
    return new NextResponse(passwordGateHtml(id, "Password salah, coba lagi."), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    await prisma.profileLink.update({ where: { id }, data: { clicks: { increment: 1 } } });
  } catch (error) {
    console.error("[PROFILE_LINK_CLICK_ERROR]", error);
  }

  return NextResponse.redirect(buildDestinationUrl(link.url, link.utmParams as UtmParams), { status: 302 });
}
