"use client";

/**
 * lib/hooks/useCountUp.ts
 *
 * Diekstrak dari components/profile/widgets/VisitorCountWidget.tsx supaya
 * bisa dipakai ulang oleh widget lain (mis. StatisticsWidget) tanpa
 * duplikasi logic animasi angka (docs/18-development-rules.md §2: "reuse
 * hooks", "jangan pernah membuat duplicate hook").
 */

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start: number | null = null;
    let raf: number;

    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
