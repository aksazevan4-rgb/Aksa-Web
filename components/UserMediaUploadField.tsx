"use client";

import { useRef, useState, useTransition } from "react";
import { Link2, Loader2, Upload, X } from "lucide-react";
import { uploadOwnMedia } from "@/lib/user-media-actions";

/**
 * Extended version of UserMediaUploadField that adds an `onUploaded` callback.
 * The original component is kept intact. This file is the replacement that
 * adds the callback without breaking existing usages (it's backward-compatible
 * — `onUploaded` is optional).
 *
 * Also extends `folder` to accept "profile-backgrounds" for BackgroundPicker.
 */

type UploadFolder = "avatars" | "banners" | "profile-backgrounds";

interface UserMediaUploadFieldProps {
  name: string;
  label: string;
  folder: UploadFolder;
  defaultValue?: string | null;
  aspectClassName?: string;
  /** Called with the uploaded URL after a successful Cloudinary upload. */
  onUploaded?: (url: string) => void;
}

export function UserMediaUploadField({
  name,
  label,
  folder,
  defaultValue,
  aspectClassName = "aspect-video",
  onUploaded,
}: UserMediaUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > 500 * 1024 * 1024) {
      setError("Ukuran file maksimal 500MB.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Format tidak didukung. Gunakan JPG, PNG, WEBP, GIF, MP4, atau WEBM.");
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
        setValue(result.url);
        setPreviewBroken(false);
        onUploaded?.(result.url);
      }
    });
  }

  const inputClass =
    "flex-1 rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors min-w-0";

  return (
    <div className="space-y-2">
      <label className="block text-xs text-text-tertiary">{label}</label>

      {/* Preview */}
      {value && !previewBroken ? (
        <div className={`relative overflow-hidden rounded-2xl border border-border bg-black/20 ${aspectClassName}`}>
          {value.match(/\.(mp4|webm)$/i) ? (
            <video
              src={value}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setPreviewBroken(true)}
            />
          )}
          <button
            type="button"
            onClick={() => { setValue(""); onUploaded?.(""); }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            aria-label="Hapus media"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}

      <input type="hidden" name={name} value={value} />

      {/* Mode tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            mode === "url" ? "bg-white/8 text-text-primary" : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          <Link2 size={12} />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 border-l border-border transition-colors ${
            mode === "upload" ? "bg-white/8 text-text-primary" : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          <Upload size={12} />
          Upload
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setPreviewBroken(false);
              onUploaded?.(e.target.value);
            }}
            placeholder="https://..."
            className={inputClass}
          />
          {value && (
            <button
              type="button"
              onClick={() => { setValue(""); onUploaded?.(""); }}
              className="flex-shrink-0 h-10 w-10 rounded-xl bg-white/5 border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-border bg-white/3 py-4 text-xs text-text-tertiary hover:border-purple/40 hover:text-text-secondary transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin text-purple" />
            ) : (
              <Upload size={14} />
            )}
            {isPending ? "Mengupload..." : "Pilih file untuk diupload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload file"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
