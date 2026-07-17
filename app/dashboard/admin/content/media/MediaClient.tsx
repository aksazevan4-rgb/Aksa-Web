"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Search, Trash2, Upload } from "lucide-react";
import { uploadMedia } from "@/lib/media-actions";
import { deleteMediaItem } from "./actions";

export interface MediaItem {
  id: string;
  url: string;
  format: string | null;
  resourceType: string;
  bytes: number | null;
  createdAt: string;
}

function displayName(item: MediaItem) {
  const parts = item.url.split("/");
  return parts[parts.length - 1] || item.id;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function MediaClient({ media }: { media: MediaItem[] }) {
  const [items, setItems] = useState(media);
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((m) =>
    displayName(m).toLowerCase().includes(query.toLowerCase())
  );

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadMedia(formData, "media-library");

    setIsUploading(false);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    if (result.url && result.mediaId) {
      setItems((prev) => [
        {
          id: result.mediaId!,
          url: result.url!,
          format: file.type.split("/")[1] ?? null,
          resourceType: "image",
          bytes: file.size,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    e.target.value = "";
  }

  function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    startTransition(async () => {
      const result = await deleteMediaItem(id);
      if (result.error) {
        setErrors((prev) => ({ ...prev, [id]: result.error! }));
        setConfirmDeleteId(null);
        return;
      }
      setItems((prev) => prev.filter((m) => m.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama file..."
            className="w-full rounded-xl bg-white/5 border border-border pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-purple/40 outline-none transition-colors"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Upload size={15} />
          )}
          Upload
        </button>
      </div>

      {uploadError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {uploadError}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-text-tertiary text-center py-12">
          {query ? "Tidak ada file yang cocok." : "Belum ada file di Media Manager."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <div key={item.id} className="glass rounded-xl overflow-hidden group">
              <div className="relative aspect-square bg-white/5">
                <Image
                  src={item.url}
                  alt={displayName(item)}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  onClick={() => handleDelete(item.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  title={
                    confirmDeleteId === item.id
                      ? "Klik sekali lagi untuk hapus permanen"
                      : "Hapus"
                  }
                  className={`absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                    confirmDeleteId === item.id
                      ? "bg-red-500 text-white"
                      : "bg-black/60 text-white hover:bg-red-500"
                  }`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-2.5">
                <p className="text-[11px] text-text-secondary truncate">
                  {displayName(item)}
                </p>
                <p className="text-[10px] text-text-tertiary">
                  {formatBytes(item.bytes)}
                </p>
                {errors[item.id] && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors[item.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
