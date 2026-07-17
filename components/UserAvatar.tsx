"use client";

import { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  /** Tailwind size classes, mis. "h-7 w-7" atau "h-20 w-20". */
  sizeClassName?: string;
  textClassName?: string;
  className?: string;
  /** Inline styles — dipakai untuk efek border dinamis (boxShadow/borderColor per-user accent) yang tidak bisa jadi Tailwind class statis. */
  style?: React.CSSProperties;
  alt?: string;
}

/**
 * Avatar yang aman dipakai di mana saja (Navbar, Topbar, dashboard, admin
 * panel, profil publik) untuk URL yang berasal dari input bebas user —
 * baik dari paste URL maupun hasil upload.
 *
 * Sengaja pakai <img> mentah, BUKAN next/image: next/image akan throw error
 * render kalau hostname tidak ada di `images.remotePatterns` next.config.ts
 * (mis. URL http:// non-https), dan itu bisa merusak seluruh halaman tanpa
 * error boundary. <img> biasa cukup memicu event `onError` yang ditangani
 * di sini untuk pindah ke fallback inisial — tidak pernah melempar error
 * React, apa pun isi URL-nya (rusak, 404, bukan gambar, dst).
 */
export function UserAvatar({
  src,
  name,
  email,
  sizeClassName = "h-9 w-9",
  textClassName = "text-sm",
  className = "",
  style,
  alt,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = (name ?? email ?? "U").trim()[0]?.toUpperCase() ?? "U";

  if (!src || failed) {
    return (
      <div
        style={style}
        className={`${sizeClassName} ${className} rounded-full bg-purple/20 flex items-center justify-center text-purple font-semibold shrink-0 ${textClassName}`}
        aria-label={alt ?? name ?? "Avatar"}
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? name ?? "Avatar"}
      onError={() => setFailed(true)}
      style={style}
      className={`${sizeClassName} ${className} rounded-full object-cover shrink-0 bg-white/5`}
    />
  );
}
