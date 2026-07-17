"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Link2, Loader2, Upload, X } from "lucide-react";
import { uploadMedia } from "@/lib/media-actions";

interface MediaUploadFieldProps {
  name: string;
  label: string;
  folder: string;
  defaultValue?: string | null;
  aspectClassName?: string; // mis. "aspect-square" untuk avatar, "aspect-[3/1]" untuk banner
}

/**
 * Field gambar serbaguna: user bisa PASTE URL langsung, ATAU upload file
 * asli dari device (file manager / galeri foto / kamera — ketiganya
 * muncul lewat native picker browser begitu tombol "Upload File" diklik,
 * tidak perlu tombol terpisah per sumber).
 *
 * Hasil akhir (baik dari URL atau upload) disimpan di hidden input
 * bernama `name`, supaya form parent yang membungkus field ini tidak
 * perlu tahu apakah nilainya berasal dari paste URL atau upload — cukup
 * baca `formData.get(name)` seperti input teks biasa.
 */
export function MediaUploadField({
  name,
  label,
  folder,
  defaultValue,
  aspectClassName = "aspect-video",
}: MediaUploadFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMedia(formData, folder);

      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        setValue(result.url);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs text-text-tertiary">{label}</label>
        <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
              mode === "url"
                ? "bg-purple/20 text-purple"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Link2 size={11} />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
              mode === "upload"
                ? "bg-purple/20 text-purple"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Upload size={11} />
            Upload
          </button>
        </div>
      </div>

      {value && (
        <div
          className={`relative mb-2 rounded-xl overflow-hidden border border-border ${aspectClassName}`}
        >
          <Image src={value} alt={label} fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {mode === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-text-secondary hover:border-purple/40 hover:text-text-primary transition-colors disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload size={15} />
                Pilih dari Galeri, Kamera, atau File
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}

      {/* Nilai final yang dibaca form parent — selalu URL string, baik
          dari mode "url" maupun hasil upload. */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
