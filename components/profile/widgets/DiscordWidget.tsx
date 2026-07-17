"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getActivityTypeLabel,
  getDiscordAvatarUrl,
  getElapsedTime,
  type LanyardPresence,
} from "@/lib/lanyard";

interface Props {
  discordId: string;
  initialPresence: LanyardPresence | null;
  showActivity?: boolean;
  showSpotify?: boolean;
  accentHex?: string;
}

/**
 * Polls the internal presence API every 15s to keep status fresh without
 * exposing the Lanyard endpoint directly to the client (keeps fetch on
 * our domain, allows future swap to custom bot infra transparently).
 */
export function DiscordWidget({
  discordId,
  initialPresence,
  showActivity = true,
  showSpotify = true,
  accentHex = "#9b6dff",
}: Props) {
  const [presence, setPresence] = useState(initialPresence);
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/discord/presence?id=${discordId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setPresence(data);
        }
      } catch {
        // Silent fail — keep last known presence rather than showing an error.
      }
    }, 15000);
    return () => clearInterval(poll);
  }, [discordId]);

  // Tick elapsed time for active activity every second.
  useEffect(() => {
    const activity = presence?.activities?.[0];
    if (!activity?.timestamps?.start) return;

    const tick = () => setElapsed(getElapsedTime(activity.timestamps!.start!));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [presence]);

  if (!presence) {
    return (
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-xs text-text-tertiary">Discord presence tidak tersedia</p>
      </div>
    );
  }

  const activity = presence.activities[0];
  const avatarUrl = getDiscordAvatarUrl(presence.discordId, presence.discordAvatarHash, 64);

  return (
    <div className="space-y-3">
      {/* Status card */}
      <div className="glass rounded-2xl p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={presence.discordDisplayName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-border"
            unoptimized
          />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
            style={{
              background: STATUS_COLORS[presence.status],
              borderColor: "var(--surface)",
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {presence.discordDisplayName}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse-dot flex-shrink-0"
              style={{ background: STATUS_COLORS[presence.status] }}
            />
            <p className="text-xs text-text-tertiary truncate">
              {presence.customStatus?.text ?? STATUS_LABELS[presence.status]}
            </p>
          </div>
        </div>
      </div>

      {/* Spotify */}
      {showSpotify && presence.spotify && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.42.122-.78-.179-.9-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.16-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-[10px] font-mono text-text-tertiary">Listening to Spotify</span>
          </div>
          <div className="flex items-center gap-3">
            {presence.spotify.albumArtUrl && (
              <Image
                src={presence.spotify.albumArtUrl}
                alt={presence.spotify.album}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg flex-shrink-0"
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">
                {presence.spotify.song}
              </p>
              <p className="text-[11px] text-text-tertiary truncate">
                {presence.spotify.artist}
              </p>
            </div>
          </div>
          {presence.spotify.timestamps && (
            <SpotifyProgressBar
              start={presence.spotify.timestamps.start}
              end={presence.spotify.timestamps.end}
            />
          )}
        </motion.div>
      )}

      {/* Activity (game, app) */}
      {showActivity && activity && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-bright rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono" style={{ color: accentHex }}>
              {getActivityTypeLabel(activity.type)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 border"
              style={{ background: `${accentHex}15`, borderColor: `${accentHex}30` }}
            >
              <span className="text-xs font-display font-bold" style={{ color: accentHex }}>
                {activity.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{activity.name}</p>
              {activity.details && (
                <p className="text-[11px] text-text-tertiary truncate">{activity.details}</p>
              )}
              {elapsed && (
                <p className="text-[10px] text-text-tertiary mt-0.5 font-mono">{elapsed} elapsed</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SpotifyProgressBar({
  start,
  end,
}: {
  start: number;
  end: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const pct = Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);
      setProgress(pct);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [start, end]);

  const totalSec = Math.floor((end - start) / 1000);
  // Derived from the ticking `progress` state rather than calling Date.now()
  // directly during render, which would make the component impure.
  const elapsedSec = Math.round((progress / 100) * totalSec);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-1.5 mt-3">
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%`, background: "#1DB954" }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-text-tertiary">
        <span>{fmt(Math.max(elapsedSec, 0))}</span>
        <span>{fmt(totalSec)}</span>
      </div>
    </div>
  );
}
