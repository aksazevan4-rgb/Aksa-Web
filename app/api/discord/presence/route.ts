/**
 * app/api/discord/presence/route.ts
 *
 * Lightweight proxy so the client polls our own domain (not Lanyard
 * directly), keeping the integration provider swappable later without
 * any client-side changes.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDiscordPresence } from "@/lib/lanyard";

export async function GET(req: NextRequest) {
  const discordId = req.nextUrl.searchParams.get("id");

  if (!discordId || !/^\d{17,20}$/.test(discordId)) {
    return NextResponse.json({ error: "Invalid Discord ID" }, { status: 400 });
  }

  const presence = await getDiscordPresence(discordId);

  if (!presence) {
    return NextResponse.json({ error: "Presence not found" }, { status: 404 });
  }

  return NextResponse.json(presence, {
    headers: { "Cache-Control": "no-store" },
  });
}
