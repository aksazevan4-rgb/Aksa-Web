"use client";

import { useRef, useState, useTransition } from "react";
import { MousePointer2, Music, Upload, X, Loader2, Play, Pause } from "lucide-react";
import { uploadOwnMedia } from "@/lib/user-media-actions";
import { updateCustomCursor, updateBackgroundAudio } from "./actions";

interface Props {
  currentCursorUrl: string | null;
  currentAudioUrl: string | null;
}

export function CursorAudioPicker({ currentCursorUrl, currentAudioUrl }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CursorCard initialUrl={currentCursorUrl} />
      <AudioCard initialUrl={currentAudioUrl} />
    </div>
  );
}

function CursorCard({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.type !== "image/png") {
      setError("Custom cursor harus berformat PNG.");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran cursor maksimal 500MB.");
      e.target.value = "";
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadOwnMedia("cursors", formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setUrl(result.url);
        await updateCustomCursor(result.url);
      }
    });
  }

  function handleRemove() {
    setUrl(null);
    startTransition(() => {
      void updateCustomCursor(null);
    });
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <MousePointer2 size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Custom Cursor</h3>
        <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5 ml-auto">
          Gratis
        </span>
      </div>
      <p className="text-xs text-text-tertiary">
        PNG, maks 500MB. Muncul saat pengunjung mengarahkan kursor di profilmu.
      </p>

      {url ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white/3 px-3.5 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Custom cursor" className="h-8 w-8 object-contain" />
          <span className="text-xs text-text-tertiary flex-1 truncate">{url}</span>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/5"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-border bg-white/3 py-6 text-xs text-text-tertiary hover:border-purple/40 hover:text-text-secondary transition-colors flex flex-col items-center justify-center gap-1.5"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-purple" />
          ) : (
            <Upload size={16} />
          )}
          {isPending ? "Mengupload..." : "Klik untuk upload PNG"}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/png"
        className="sr-only"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function AudioCard({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const allowed = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"];
    if (!allowed.includes(file.type)) {
      setError("Format audio tidak didukung. Gunakan MP3, OGG, atau WAV.");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran audio maksimal 500MB.");
      e.target.value = "";
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadOwnMedia("background-audio", formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setUrl(result.url);
        await updateBackgroundAudio(result.url);
      }
    });
  }

  function handleRemove() {
    setUrl(null);
    setPlaying(false);
    startTransition(() => {
      void updateBackgroundAudio(null);
    });
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Music size={15} className="text-purple" />
        <h3 className="text-sm font-semibold text-text-primary">Background Audio</h3>
        <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5 ml-auto">
          Gratis
        </span>
      </div>
      <p className="text-xs text-text-tertiary">
        MP3/OGG/WAV, maks 500MB. Diputar (dengan tombol play) saat pengunjung membuka profilmu.
      </p>

      {url ? (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white/3 px-3.5 py-3">
          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-purple flex-shrink-0"
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
          <span className="text-xs text-text-tertiary flex-1 truncate">{url}</span>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/5"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-border bg-white/3 py-6 text-xs text-text-tertiary hover:border-purple/40 hover:text-text-secondary transition-colors flex flex-col items-center justify-center gap-1.5"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-purple" />
          ) : (
            <Upload size={16} />
          )}
          {isPending ? "Mengupload..." : "Klik untuk upload audio"}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="audio/mpeg,audio/ogg,audio/wav,audio/webm"
        className="sr-only"
        onChange={handleFile}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
