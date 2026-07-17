"use client";

/**
 * components/profile/widgets/ClockWidget.tsx
 * Jam real-time, opsional timezone kustom (docs/09-widget-system.md §3).
 * Sama seperti CountdownWidget — nilai waktu diisi setelah mount untuk
 * menghindari hydration mismatch (docs/16 §6).
 */

import { useEffect, useState } from "react";

interface ClockWidgetProps {
  timezone?: string; // contoh: "Asia/Jakarta"
  accentHex?: string;
}

export function ClockWidget({ timezone, accentHex = "#9b6dff" }: ClockWidgetProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: timezone || undefined,
      }).format(new Date());

    const tick = () => setTime(format());
    // setTimeout(0) untuk update pertama — menghindari cascading render
    // sinkron (aturan react-hooks/set-state-in-effect), sama seperti
    // CountdownWidget.
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [timezone]);

  return (
    <div className="glass-bright rounded-2xl px-4 py-3 flex items-center justify-between">
      <span className="text-xs text-text-secondary">{timezone ?? "Waktu lokal"}</span>
      {!time ? (
        <div className="h-5 w-16 rounded-md bg-border/60 animate-pulse" aria-hidden />
      ) : (
        <span className="font-mono text-sm font-medium" style={{ color: accentHex }}>
          {time}
        </span>
      )}
    </div>
  );
}
