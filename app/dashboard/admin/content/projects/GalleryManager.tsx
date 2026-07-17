"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { GripVertical, Images, Loader2, Plus, Trash2 } from "lucide-react";
import { uploadMedia } from "@/lib/media-actions";
import {
  addGalleryImage,
  removeGalleryImage,
  reorderGalleryImages,
} from "./actions";

export interface GalleryImageData {
  id: string;
  url: string;
}

/**
 * Pengelola galeri foto tambahan per project (screenshot, demo, dst) —
 * di luar thumbnail/banner utama. Cuma muncul saat project SUDAH ada
 * (punya id), karena galeri adalah relasi terpisah lewat
 * ProjectGalleryImage, bukan field langsung di Project seperti
 * thumbnail/banner.
 */
export function GalleryManager({
  projectId,
  initialImages,
}: {
  projectId: string;
  initialImages: GalleryImageData[];
}) {
  const [images, setImages] = useState(initialImages);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    const uploadResult = await uploadMedia(formData, "project-gallery");

    if (uploadResult.error) {
      setError(uploadResult.error);
      setIsUploading(false);
      return;
    }

    if (uploadResult.url && uploadResult.mediaId) {
      const addResult = await addGalleryImage(projectId, uploadResult.url);
      if (addResult.error) {
        setError(addResult.error);
      } else {
        setImages((prev) => [
          ...prev,
          { id: uploadResult.mediaId!, url: uploadResult.url! },
        ]);
      }
    }

    setIsUploading(false);
    e.target.value = "";
  }

  function handleRemove(galleryImageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== galleryImageId));
    startTransition(() => {
      void removeGalleryImage(galleryImageId);
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setImages(next);
    setDragIndex(null);
    startTransition(() => {
      void reorderGalleryImages(next.map((img) => img.id));
    });
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-2">
        <Images size={12} />
        Galeri Foto Tambahan
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((img, index) => (
          <div
            key={img.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-white/3 cursor-grab"
          >
            <Image
              src={img.url}
              alt="Galeri"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
            <GripVertical
              size={12}
              className="absolute top-1 left-1 text-white/0 group-hover:text-white/70 transition-colors"
            />
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              disabled={isPending}
              title="Hapus dari galeri"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all disabled:opacity-50"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={isUploading}
          className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-purple/50 hover:bg-white/[0.03] flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-purple transition-all disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Plus size={18} />
              <span className="text-[10px]">Tambah</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-2 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-[11px] text-text-tertiary mt-2">
        Tampil sebagai galeri tambahan saat project dibuka. Drag untuk
        mengurutkan.
      </p>
    </div>
  );
}
