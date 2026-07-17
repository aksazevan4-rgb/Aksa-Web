"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";

interface Props {
  url: string;
  accentHex?: string;
}

/** Turns a stored file/URL into a human-readable track title —
 * "beware-death-grips_final.mp3" -> "beware death grips final". Falls back
 * to a generic label when the URL has no usable filename segment. */
function titleFromUrl(url: string): string {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const file = path.split("/").pop() ?? "";
    const withoutExt = file.replace(/\.[a-z0-9]+$/i, "");
    const cleaned = withoutExt.replace(/[-_]+/g, " ").trim();
    return cleaned || "Musik profil";
  } catch {
    return "Musik profil";
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * components/profile/ProfileMusicPlayer.tsx
 *
 * Floating "now playing" bar for User.backgroundAudioUrl — the guns.lol-
 * style bio pages this mirrors always surface the background track as a
 * persistent bottom-corner widget (title + scrubber), not a bare icon
 * button. Autoplay stays paused-by-default since browsers block audio
 * without a user gesture; the button just reflects real playback state.
 */
export function ProfileMusicPlayer({ url, accentHex = "#9b6dff" }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const title = titleFromUrl(url);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {
        // Blocked without a user gesture — button just stays paused.
      });
    }
  }

  const pct = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <div className="fixed bottom-5 left-5 z-40 w-[260px] max-w-[calc(100vw-2.5rem)]">
      <audio ref={audioRef} src={url} loop preload="metadata" className="hidden" />
      <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg px-3.5 py-3 flex items-center gap-3">
        <button
          onClick={toggle}
          title={playing ? "Jeda musik profil" : "Putar musik profil"}
          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-white transition-transform active:scale-95"
          style={{ background: `${accentHex}30`, border: `1px solid ${accentHex}55` }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Music2 size={11} className="text-white/50 flex-shrink-0" />
            <p className="text-xs font-medium text-white truncate capitalize">{title}</p>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-200"
              style={{ width: `${pct}%`, background: accentHex }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[9px] font-mono text-white/40">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
