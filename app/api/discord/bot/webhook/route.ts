/**
 * app/api/discord/bot/webhook/route.ts
 *
 * Phase 3 — Custom Discord Bot webhook receiver.
 *
 * This route receives presence update events from your own Discord bot
 * (hosted separately). The bot listens to PRESENCE_UPDATE gateway events
 * and pushes data here via HTTP POST with HMAC signature.
 *
 * Architecture:
 *   [Discord Gateway] → [Your Bot (Node.js)] → POST /api/discord/bot/webhook
 *                                               → store in DB / Redis
 *                                               ← SSE / polling by profile page
 *
 * For Phase 2 (Lanyard): use /api/discord/presence instead (no bot needed).
 * This file is for Phase 3 when you want full control over presence data.
 *
 * Security:
 *   - Validates HMAC-SHA256 signature using DISCORD_BOT_WEBHOOK_SECRET env var.
 *   - Rejects requests without valid signature.
 *   - Rate limited via edge config or middleware (not implemented here).
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.DISCORD_BOT_WEBHOOK_SECRET;

interface BotPresencePayload {
  discordId: string;
  // Identity fields — optional because older/minimal bot builds may omit
  // them, but required in practice for the profile widget to show a name
  // and avatar when reading from this cache instead of Lanyard.
  discordUsername?: string;
  discordDisplayName?: string;
  discordAvatarHash?: string | null;
  status: "online" | "idle" | "dnd" | "offline";
  customStatus?: {
    text: string | null;
    emoji: string | null;
  } | null;
  spotify?: {
    song: string;
    artist: string;
    album: string;
    albumArtUrl: string | null;
    trackId: string | null;
    timestampStart: number;
    timestampEnd: number;
  } | null;
  activities?: Array<{
    id: string;
    name: string;
    type: number;
    details: string | null;
    state: string | null;
    timestampStart: number | null;
  }>;
}

export async function POST(req: NextRequest) {
  // ── Signature check ────────────────────────────────────────────────────────
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Bot webhook not configured." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("x-aksa-signature");
  const body = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // ── Parse payload ──────────────────────────────────────────────────────────
  let payload: BotPresencePayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!payload.discordId || !/^\d{17,20}$/.test(payload.discordId)) {
    return NextResponse.json({ error: "Invalid discordId." }, { status: 400 });
  }

  // ── Store presence in DB ───────────────────────────────────────────────────
  // In production, consider Redis for speed (TTL: 60s) if write volume grows.
  // For now: JSON column on the User row, read back by resolveDiscordPresence()
  // in lib/lanyard.ts (used for freshness-gated fallback from the profile page).
  let stored = false;
  try {
    const result = await prisma.user.updateMany({
      where: { discordId: payload.discordId },
      data: {
        discordPresenceCache: payload as object,
        discordPresenceUpdatedAt: new Date(),
      },
    });
    stored = result.count > 0;
  } catch (err) {
    console.error("[BOT_WEBHOOK_DB_ERROR]", err);
    return NextResponse.json({ error: "Failed to store presence." }, { status: 500 });
  }

  if (!stored) {
    // Signature was valid but no user in our DB has this discordId linked.
    // Not an error on the bot's side — just nothing to do here.
    console.warn("[BOT_WEBHOOK] No linked user for discordId", payload.discordId);
  }

  // Log for debugging during Phase 3 setup.
  console.log("[BOT_WEBHOOK] Received presence for", payload.discordId, {
    status: payload.status,
    hasSpotify: Boolean(payload.spotify),
    activityCount: payload.activities?.length ?? 0,
    stored,
  });

  return NextResponse.json({ received: true, stored });
}
