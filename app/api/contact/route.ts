import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Contact form is user-initiated (has a submit button + visible error state),
// so unlike profile-view tracking we return a real 429 the UI can show.
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 10 menit
const CONTACT_MAX = 3;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const { allowed, retryAfterMs } = checkRateLimit(`contact:${ip ?? "unknown"}`, {
      windowMs: CONTACT_WINDOW_MS,
      max: CONTACT_MAX,
    });

    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak pesan terkirim. Coba lagi dalam beberapa menit." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
      targetUserId?: string;
    };

    const { name, email, message, targetUserId } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim() || !targetUserId) {
      return NextResponse.json({ error: "Field tidak lengkap." }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: "Pesan terlalu pendek." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, accountStatus: true },
    });

    if (!target || target.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    await prisma.message.create({
      data: {
        userId: targetUserId,
        name: name.trim(),
        email: email.trim(),
        subject: `Pesan dari ${name.trim()}`,
        body: message.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACT_API_ERROR]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
