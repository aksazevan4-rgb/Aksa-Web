/**
 * app/api/profile/view/route.ts
 *
 * Alternate, client-callable entry point for recording a profile view —
 * same underlying logic as the server-side increment in app/[username]/page.tsx
 * (both call lib/profile-views.ts so there's one source of truth).
 *
 * Useful for client-side navigation (e.g. SPA-style widget previews) where a
 * full server render of app/[username]/page.tsx doesn't happen. Rate limited
 * per IP+profile — see lib/profile-views.ts.
 *
 * NOTE: userId comes from the request body, so this endpoint is intentionally
 * conservative: it only ever increments a counter (no read/leak of other
 * data), and it's rate limited hard enough that scripting it repeatedly
 * stops moving the number after a handful of calls per 5 minutes.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordProfileView } from "@/lib/profile-views";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { userId?: string };
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Confirm the id actually belongs to an active user before recording
    // anything — otherwise this becomes a free-form counter for garbage ids.
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountStatus: true },
    });

    if (!target || target.accountStatus !== "ACTIVE") {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    const { recorded } = await recordProfileView(userId, req.headers);

    return NextResponse.json({ ok: true, recorded });
  } catch (err) {
    console.error("[PROFILE_VIEW_ERROR]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
