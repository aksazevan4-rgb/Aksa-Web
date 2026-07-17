/**
 * lib/lanyard.ts
 *
 * Discord real-time presence via Lanyard API (https://lanyard.rest).
 * Lanyard handles the Discord bot + WebSocket layer for us.
 *
 * Users link their Discord ID in profile settings. We fetch presence
 * data on-demand and optionally stream updates via SSE on the profile page.
 *
 * To use: user must be in the Lanyard Discord server (discord.gg/lanyard)
 * OR you can host your own Lanyard instance and set LANYARD_API_URL.
 *
 * Future: replace with custom Discord bot for full control.
 */

export const LANYARD_BASE =
  process.env.LANYARD_API_URL ?? "https://api.lanyard.rest/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpotifyData {
  song: string;
  artist: string;
  album: string;
  albumArtUrl: string | null;
  trackId: string | null;
  timestamps: {
    start: number;
    end: number;
  } | null;
}

export interface ActivityAssets {
  largeImage: string | null;
  largeText: string | null;
  smallImage: string | null;
  smallText: string | null;
}

export interface DiscordActivity {
  id: string;
  name: string;
  type: number; // 0=Playing, 1=Streaming, 2=Listening, 3=Watching, 5=Competing
  details: string | null;
  state: string | null;
  applicationId: string | null;
  timestamps: { start: number | null; end: number | null } | null;
  assets: ActivityAssets | null;
  party: { id: string | null; size: [number, number] | null } | null;
}

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardPresence {
  discordId: string;
  discordUsername: string;
  discordDisplayName: string;
  discordAvatarHash: string | null;
  status: DiscordStatus;
  customStatus: {
    text: string | null;
    emoji: string | null;
    emojiId: string | null;
    state: string | null;
  } | null;
  spotify: SpotifyData | null;
  activities: DiscordActivity[];
  activeOnMobile: boolean;
  activeOnDesktop: boolean;
  activeOnWeb: boolean;
}

interface LanyardApiResponse {
  success: boolean;
  data?: LanyardRawData;
  error?: { message: string };
}

interface LanyardRawData {
  discord_user: {
    id: string;
    username: string;
    display_name: string;
    avatar: string | null;
  };
  discord_status: string;
  kv: Record<string, string>;
  spotify: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string | null;
    track_id: string | null;
    timestamps: { start: number; end: number } | null;
  } | null;
  activities: Array<{
    id: string;
    name: string;
    type: number;
    details?: string;
    state?: string;
    application_id?: string;
    timestamps?: { start?: number; end?: number };
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    party?: { id?: string; size?: [number, number] };
    emoji?: { name: string; id?: string };
  }>;
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetch Discord presence for a user by their Discord ID.
 * Returns null if user is not on Lanyard or fetch fails.
 *
 * Cache: 15s (presence can change rapidly). Do NOT use unstable_cache
 * for this — it's always user-specific and changes frequently.
 */
export async function getDiscordPresence(
  discordId: string
): Promise<LanyardPresence | null> {
  if (!discordId) return null;

  try {
    const res = await fetch(`${LANYARD_BASE}/users/${discordId}`, {
      next: { revalidate: 15 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as LanyardApiResponse;
    if (!json.success || !json.data) return null;

    return normalizeLanyardData(json.data);
  } catch {
    return null;
  }
}

function normalizeLanyardData(raw: LanyardRawData): LanyardPresence {
  const customStatusActivity = raw.activities.find((a) => a.type === 4);

  return {
    discordId: raw.discord_user.id,
    discordUsername: raw.discord_user.username,
    discordDisplayName: raw.discord_user.display_name,
    discordAvatarHash: raw.discord_user.avatar,
    status: raw.discord_status as DiscordStatus,
    customStatus: customStatusActivity
      ? {
          text: customStatusActivity.state ?? null,
          emoji: customStatusActivity.emoji?.name ?? null,
          emojiId: customStatusActivity.emoji?.id ?? null,
          state: customStatusActivity.details ?? null,
        }
      : null,
    spotify: raw.spotify
      ? {
          song: raw.spotify.song,
          artist: raw.spotify.artist,
          album: raw.spotify.album,
          albumArtUrl: raw.spotify.album_art_url,
          trackId: raw.spotify.track_id,
          timestamps: raw.spotify.timestamps,
        }
      : null,
    activities: raw.activities
      .filter((a) => a.type !== 4) // exclude custom status
      .map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        details: a.details ?? null,
        state: a.state ?? null,
        applicationId: a.application_id ?? null,
        timestamps: a.timestamps
          ? { start: a.timestamps.start ?? null, end: a.timestamps.end ?? null }
          : null,
        assets: a.assets
          ? {
              largeImage: a.assets.large_image ?? null,
              largeText: a.assets.large_text ?? null,
              smallImage: a.assets.small_image ?? null,
              smallText: a.assets.small_text ?? null,
            }
          : null,
        party: a.party
          ? { id: a.party.id ?? null, size: a.party.size ?? null }
          : null,
      })),
    activeOnMobile: raw.active_on_discord_mobile,
    activeOnDesktop: raw.active_on_discord_desktop,
    activeOnWeb: raw.active_on_discord_web,
  };
}

/**
 * How long a webhook-pushed presence stays "fresh" before we stop trusting
 * it and fall back to Lanyard. The bot pushes on every presenceUpdate
 * gateway event, so under normal operation this is refreshed constantly;
 * if the bot process dies or disconnects, cache goes stale after this
 * window and callers self-heal back to Lanyard without any manual step.
 */
const PRESENCE_CACHE_MAX_AGE_MS = 90 * 1000;

/** Loose shape of what's actually stored in User.discordPresenceCache. */
interface BotPresenceCacheShape {
  discordId: string;
  discordUsername?: string;
  discordDisplayName?: string;
  discordAvatarHash?: string | null;
  status: DiscordStatus;
  customStatus?: { text: string | null; emoji: string | null } | null;
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

function mapBotCacheToPresence(cache: BotPresenceCacheShape): LanyardPresence {
  return {
    discordId: cache.discordId,
    discordUsername: cache.discordUsername ?? "",
    discordDisplayName:
      cache.discordDisplayName ??
      cache.discordUsername ??
      "Discord user",
    discordAvatarHash: cache.discordAvatarHash ?? null,
    status: cache.status,
    customStatus: cache.customStatus
      ? {
          text: cache.customStatus.text,
          emoji: cache.customStatus.emoji,
          emojiId: null,
          state: null,
        }
      : null,
    spotify: cache.spotify
      ? {
          song: cache.spotify.song,
          artist: cache.spotify.artist,
          album: cache.spotify.album,
          albumArtUrl: cache.spotify.albumArtUrl,
          trackId: cache.spotify.trackId,
          timestamps: {
            start: cache.spotify.timestampStart,
            end: cache.spotify.timestampEnd,
          },
        }
      : null,
    activities: (cache.activities ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      details: a.details,
      state: a.state,
      applicationId: null,
      timestamps: a.timestampStart
        ? {
            start: a.timestampStart,
            end: null,
          }
        : null,
      assets: null,
      party: null,
    })),
    
    activeOnMobile: false,
    activeOnDesktop: false,
    activeOnWeb: false,
  };
}

/**
 * Resolve the presence to show on a public profile: prefer a fresh
 * custom-bot cache (no network call needed), fall back to Lanyard when the
 * cache is missing/stale, and return null when Discord isn't linked at all.
 */
export async function resolveDiscordPresence(user: {
  discordId: string | null;
  discordLinked: boolean;
  discordPresenceCache: unknown;
  discordPresenceUpdatedAt: Date | null;
}): Promise<LanyardPresence | null> {
  if (!user.discordLinked || !user.discordId) return null;

  const isFresh =
    user.discordPresenceUpdatedAt &&
    Date.now() - user.discordPresenceUpdatedAt.getTime() < PRESENCE_CACHE_MAX_AGE_MS;

  if (isFresh && user.discordPresenceCache) {
    return mapBotCacheToPresence(user.discordPresenceCache as BotPresenceCacheShape);
  }

  return getDiscordPresence(user.discordId);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<DiscordStatus, string> = {
  online: "Online",
  idle: "Away",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

export const STATUS_COLORS: Record<DiscordStatus, string> = {
  online: "#34d399",
  idle: "#fbbf24",
  dnd: "#ef4444",
  offline: "#6b7280",
};

export function getActivityTypeLabel(type: number): string {
  switch (type) {
    case 0: return "Playing";
    case 1: return "Streaming";
    case 2: return "Listening to";
    case 3: return "Watching";
    case 5: return "Competing in";
    default: return "";
  }
}

/** Get elapsed time string from a Unix timestamp. */
export function getElapsedTime(startMs: number): string {
  const elapsed = Math.floor((Date.now() - startMs) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Build Discord CDN avatar URL from hash. */
export function getDiscordAvatarUrl(
  discordId: string,
  avatarHash: string | null,
  size = 128
): string {
  if (!avatarHash) {
    const defaultIndex = (BigInt(discordId) >> 22n) % 6n;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  const ext = avatarHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=${size}`;
}
