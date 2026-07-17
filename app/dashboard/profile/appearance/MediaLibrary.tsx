"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImageIcon,
  Rows3,
  Music,
  MousePointer2,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Settings2,
} from "lucide-react";
import { uploadOwnMedia } from "@/lib/user-media-actions";
import {
  updateAvatarUrl,
  updateBannerUrl,
  updateBackgroundMedia,
  updateCustomCursor,
  updateBackgroundAudio,
} from "./actions";

interface Props {
  currentAvatarUrl: string | null;
  currentBannerUrl: string | null;
  currentBackgroundUrl: string | null;
  currentCursorUrl: string | null;
  currentAudioUrl: string | null;
}

/**
 * components/.../MediaLibrary.tsx
 *
 * All profile media assets (avatar, banner, background, cursor, audio) in
 * one consolidated panel instead of split across the "Profil Saya" form
 * and separate appearance tabs — each card uploads and saves itself
 * instantly, no shared "Simpan" button to remember. The advanced
 * background options (solid/gradient/aurora/etc + colors) stay in the
 * BackgroundPicker below this grid; the Background card here is just the
 * fast path for "upload a file and go".
 */
export function MediaLibrary({
  currentAvatarUrl,
  currentBannerUrl,
  currentBackgroundUrl,
  currentCursorUrl,
  currentAudioUrl,
}: Props) {
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Media Profil</h3>
        <p className="text-xs text-text-tertiary mt-1">
          Semua aset visual profilmu di satu tempat — upload langsung tersimpan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MediaCard
          icon={ImageIcon}
          title="Avatar"
          hint="JPG/PNG/WEBP/GIF, maks 500MB."
          accept="image/jpeg,image/png,image/webp,image/gif"
          folder="avatars"
          initialUrl={currentAvatarUrl}
          previewClassName="aspect-square rounded-full w-24 mx-auto"
          onSave={(url) => updateAvatarUrl(url)}
        />

        <MediaCard
          icon={Rows3}
          title="Banner"
          hint="JPG/PNG/WEBP/GIF, maks 500MB."
          accept="image/jpeg,image/png,image/webp,image/gif"
          folder="banners"
          initialUrl={currentBannerUrl}
          previewClassName="aspect-[3/1] rounded-xl"
          onSave={(url) => updateBannerUrl(url)}
        />

        <MediaCard
          icon={ImageIcon}
          title="Background"
          hint="Gambar atau video, maks 500MB. Opsi lanjutan (warna/efek) ada di bawah."
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          folder="profile-backgrounds"
          initialUrl={currentBackgroundUrl}
          previewClassName="aspect-video rounded-xl"
          isMedia
          onSave={(url, kind) => updateBackgroundMedia(url, (kind === "video" ? "video" : "image"))}
        />

        <MediaCard
          icon={Music}
          title="Background Audio"
          hint="MP3/OGG/WAV, maks 500MB. Diputar dengan tombol play saat profil dibuka."
          accept="audio/mpeg,audio/ogg,audio/wav,audio/webm"
          folder="background-audio"
          initialUrl={currentAudioUrl}
          previewClassName="rounded-xl"
          isAudio
          onSave={(url) => updateBackgroundAudio(url)}
        />

        <MediaCard
          icon={MousePointer2}
          title="Custom Cursor"
          hint="PNG, maks 500MB. Muncul saat pengunjung mengarahkan kursor di profilmu."
          accept="image/png"
          folder="cursors"
          initialUrl={currentCursorUrl}
          previewClassName="h-16 w-16 mx-auto"
          isCursor
          onSave={(url) => updateCustomCursor(url)}
        />
      </div>
    </div>
  );
}

interface MediaCardProps {
  icon: React.ElementType;
  title: string;
  hint: string;
  accept: string;
  folder: string;
  initialUrl: string | null;
  previewClassName: string;
  isMedia?: boolean;
  isAudio?: boolean;
  isCursor?: boolean;
  onSave: (url: string | null, kind?: "image" | "video") => Promise<unknown>;
}

function MediaCard({
  icon: Icon,
  title,
  hint,
  accept,
  folder,
  initialUrl,
  previewClassName,
  isMedia,
  isAudio,
  isCursor,
  onSave,
}: MediaCardProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isVideoFile = (u: string) => /\.(mp4|webm)$/i.test(u);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran file maksimal 500MB.");
      e.target.value = "";
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadOwnMedia(folder, formData);
      if (result.error) {
        setError(result.error);
        e.target.value = "";
        return;
      }
      if (result.url) {
        setUrl(result.url);
        await onSave(result.url, file.type.startsWith("video/") ? "video" : "image");
      }
    });
  }

  function handleReset() {
    setUrl(null);
    setPlaying(false);
    startTransition(async () => {
      await onSave(null);
    });
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="rounded-2xl border border-border bg-white/3 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-purple" />
        <h4 className="text-xs font-semibold text-text-primary">{title}</h4>
        {url && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            title="Reset"
            className="ml-auto h-6 w-6 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      <p className="text-[11px] text-text-tertiary leading-relaxed">{hint}</p>

      {url ? (
        <div className="relative group">
          {isAudio ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3.5 py-3">
              <button
                type="button"
                onClick={togglePlay}
                className="h-9 w-9 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-purple flex-shrink-0"
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} className="hidden" />
              <span className="text-[11px] text-text-tertiary flex-1 truncate">{url.split("/").pop()}</span>
            </div>
          ) : isCursor ? (
            <div className={`relative overflow-hidden rounded-xl border border-border bg-black/20 flex items-center justify-center ${previewClassName}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={title} className="max-h-10 max-w-10 object-contain" />
            </div>
          ) : isMedia && isVideoFile(url) ? (
            <div className={`relative overflow-hidden border border-border bg-black/20 ${previewClassName}`}>
              <video src={url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ) : (
            <div className={`relative overflow-hidden border border-border bg-black/20 ${previewClassName}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={title} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-border bg-white/3 py-6 text-xs text-text-tertiary hover:border-purple/40 hover:text-text-secondary transition-colors flex flex-col items-center justify-center gap-1.5"
        >
          {isPending ? <Loader2 size={16} className="animate-spin text-purple" /> : <Upload size={16} />}
          {isPending ? "Mengupload..." : "Klik untuk upload"}
        </button>
      )}

      {url && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border border-border bg-white/3 py-2 text-[11px] text-text-secondary hover:border-purple/40 hover:text-text-primary transition-colors flex items-center justify-center gap-1.5"
        >
          {isPending ? <Loader2 size={12} className="animate-spin text-purple" /> : <Settings2 size={12} />}
          {isPending ? "Mengupload..." : "Ganti file"}
        </button>
      )}

      <input ref={fileRef} type="file" accept={accept} className="sr-only" onChange={handleFile} aria-label={`Upload ${title}`} />
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
