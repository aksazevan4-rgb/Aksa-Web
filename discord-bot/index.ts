/**
 * discord-bot/index.ts
 *
 * Phase 3 — Standalone Discord Bot (runs as a separate Node.js process).
 *
 * Stack: discord.js v14 + axios for webhook delivery.
 *
 * Setup:
 *   1. cd discord-bot
 *   2. npm init -y
 *   3. npm install discord.js axios
 *   4. cp .env.example .env  → fill in values
 *   5. npx tsx index.ts
 *
 * Environment variables needed (.env in discord-bot/ folder):
 *   DISCORD_BOT_TOKEN         = your bot token
 *   AKSA_WEBHOOK_URL          = https://yourdomain.com/api/discord/bot/webhook
 *   DISCORD_BOT_WEBHOOK_SECRET = must match DISCORD_BOT_WEBHOOK_SECRET in Next.js app
 *
 * The bot:
 *   - Connects to Discord Gateway with GUILD_PRESENCES intent.
 *   - Listens for presenceUpdate events.
 *   - Sends HMAC-signed POST to the Next.js webhook endpoint.
 *   - Only forwards presence data for users whose Discord ID is registered
 *     in AKSA (reduces noise; full list fetched from your API periodically).
 *
 * Discord Developer Portal requirements:
 *   - Enable SERVER MEMBERS INTENT ✓
 *   - Enable PRESENCE INTENT ✓
 *   - Bot must be in at least one shared server with the tracked users.
 *
 * Phase 2 alternative (simpler):
 *   Use Lanyard API (/api/discord/presence route) — no bot needed, users
 *   just need to join discord.gg/lanyard.
 */

import { createHmac } from "crypto";
// import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";
// import axios from "axios";

// ── Config ────────────────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const WEBHOOK_URL = process.env.AKSA_WEBHOOK_URL!;
const WEBHOOK_SECRET = process.env.DISCORD_BOT_WEBHOOK_SECRET!;

if (!BOT_TOKEN || !WEBHOOK_URL || !WEBHOOK_SECRET) {
  throw new Error(
    "Missing required env vars: DISCORD_BOT_TOKEN, AKSA_WEBHOOK_URL, DISCORD_BOT_WEBHOOK_SECRET"
  );
}

// ── HMAC signature ────────────────────────────────────────────────────────────

// Used by the example handler below once discord.js is installed and the
// block comment is activated (see Setup steps above). Kept here so the
// webhook-signing logic is ready when the Discord bot integration is wired up.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function signPayload(payload: string): string {
  return createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
}

// ── Example bot setup (uncomment after installing discord.js) ─────────────────

/*
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.GuildMember],
});

client.once("ready", () => {
  console.log(`[AKSA Bot] Logged in as ${client.user?.tag}`);
});

client.on("presenceUpdate", async (_oldPresence, newPresence) => {
  if (!newPresence.userId) return;

  const activities = newPresence.activities ?? [];
  const spotify = activities.find((a) => a.name === "Spotify");
  const customStatus = activities.find((a) => a.type === ActivityType.Custom);
  const gameActivities = activities.filter(
    (a) => a.type !== ActivityType.Custom && a.name !== "Spotify"
  );

  const payload = {
    discordId: newPresence.userId,
    // GuildMember has the richer, guild-specific display name; fall back to
    // the bare Discord username if the presence has no member context.
    discordUsername: newPresence.member?.user.username,
    discordDisplayName: newPresence.member?.displayName ?? newPresence.member?.user.username,
    discordAvatarHash: newPresence.member?.user.avatar ?? null,
    status: newPresence.status ?? "offline",
    customStatus: customStatus
      ? { text: customStatus.state ?? null, emoji: customStatus.emoji?.name ?? null }
      : null,
    spotify: spotify
      ? {
          song: spotify.details ?? "",
          artist: spotify.state ?? "",
          album: (spotify as any).assets?.largeText ?? "",
          albumArtUrl: spotify.assets?.largeImageURL() ?? null,
          trackId: (spotify as any).syncId ?? null,
          timestampStart: spotify.timestamps?.start?.getTime() ?? Date.now(),
          timestampEnd: spotify.timestamps?.end?.getTime() ?? Date.now() + 200000,
        }
      : null,
    activities: gameActivities.map((a) => ({
      id: a.applicationId ?? a.name,
      name: a.name,
      type: a.type,
      details: a.details ?? null,
      state: a.state ?? null,
      timestampStart: a.timestamps?.start?.getTime() ?? null,
    })),
  };

  const body = JSON.stringify(payload);
  const signature = signPayload(body);

  try {
    await axios.post(WEBHOOK_URL, body, {
      headers: {
        "Content-Type": "application/json",
        "x-aksa-signature": signature,
      },
      timeout: 5000,
    });
  } catch (err: any) {
    console.error("[BOT_WEBHOOK_ERROR]", err?.message);
  }
});

client.login(BOT_TOKEN);
*/

console.log(
  "[AKSA Discord Bot] Starter file. Uncomment the discord.js code above after installing dependencies."
);
console.log("npm install discord.js axios");
