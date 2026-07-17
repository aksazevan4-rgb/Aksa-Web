"use client";

/**
 * components/profile/widgets/CountdownWidget.tsx
 *
 * Hitung mundur murni client-side (docs/09-widget-system.md §3, kategori
 * "Data & Utilitas"). Tidak butuh data server — aman dari hydration
 * mismatch karena angka detik pertama kali dihitung di useEffect (setelah
 * mount), bukan langsung saat render server (docs/16-performance-security.md §6).
 */

import { useEffect, useState } from "react";

interface CountdownWidgetProps {
  label: string;
  targetDate: string; // ISO string
  accentHex?: string;
}

function getTimeParts(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff <= 0,
  };
}

export function CountdownWidget({ label, targetDate, accentHex = "#9b6dff" }: CountdownWidgetProps) {
  const targetMs = new Date(targetDate).getTime();
  // Placeholder netral saat server-render — nilai asli diisi setelah mount
  // di client, sesuai aturan cegah hydration mismatch (docs/16 §6).
  const [parts, setParts] = useState<ReturnType<typeof getTimeParts> | null>(null);

  useEffect(() => {
    const tick = () => setParts(getTimeParts(targetMs));
    // setTimeout(0) alih-alih memanggil setState langsung di badan efek —
    // menghindari cascading render sinkron (aturan react-hooks/set-state-in-effect).
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [targetMs]);

  return (
    <div className="glass-bright rounded-2xl px-4 py-3 space-y-2">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      {!parts ? (
        <div className="h-8 rounded-md bg-border/60 animate-pulse" aria-hidden />
      ) : parts.done ? (
        <p className="text-sm font-semibold" style={{ color: accentHex }}>
          Sudah tiba! 🎉
        </p>
      ) : (
        <div className="flex gap-3 font-mono text-sm text-text-primary">
          <span>{parts.days}h</span>
          <span>{parts.hours}j</span>
          <span>{parts.minutes}m</span>
          <span>{parts.seconds}d</span>
        </div>
      )}
    </div>
  );
}
