"use client";

import { useRef, useState } from "react";
import { Play, Pause, Music } from "lucide-react";

export function BackgroundAudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        // Browser blocked playback (e.g. no user gesture registered) —
        // fail silently, button just stays in "play" state.
      });
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <audio ref={audioRef} src={url} loop onEnded={() => setPlaying(false)} className="hidden" />
      <button
        onClick={toggle}
        title={playing ? "Jeda musik profil" : "Putar musik profil"}
        className="h-11 w-11 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors shadow-lg"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
        <span className="sr-only">{playing ? "Pause" : "Play"} background music</span>
      </button>
      {!playing && (
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-purple flex items-center justify-center">
          <Music size={8} className="text-white" />
        </span>
      )}
    </div>
  );
}
