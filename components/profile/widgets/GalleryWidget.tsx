"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GalleryImage {
  url: string;
  caption?: string;
}

interface Props {
  images: GalleryImage[];
  accentHex?: string;
}

/**
 * components/profile/widgets/GalleryWidget.tsx
 * Photo grid with a simple click-to-expand lightbox. Data stored in
 * User.widgetConfig: { gallery: { enabled: true, config: { items: GalleryImage[] } } }
 */
export function GalleryWidget({ images, accentHex = "#9b6dff" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex]);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((image, i) => (
          <motion.button
            key={image.url + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="relative aspect-square overflow-hidden rounded-xl border border-border group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.caption || "Gambar galeri"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {image.caption && (
              <div
                className="absolute inset-x-0 bottom-0 px-2 py-1.5 text-[10px] text-white/90 truncate opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}
              >
                {image.caption}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && images[openIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenIndex(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Pratinjau gambar galeri"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Tutup"
              className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
              style={{ color: accentHex }}
            >
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[openIndex].url}
                alt={images[openIndex].caption || "Gambar galeri"}
                className="w-full rounded-2xl object-contain max-h-[70vh]"
              />
              {images[openIndex].caption && (
                <p className="mt-3 text-center text-sm text-white/80">{images[openIndex].caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
