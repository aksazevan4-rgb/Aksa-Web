"use client";

import { Eye } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface Props {
  count: number;
  accentHex?: string;
}

/**
 * components/profile/widgets/VisitorCountWidget.tsx
 */
export function VisitorCountWidget({ count, accentHex = "#9b6dff" }: Props) {
  const animated = useCountUp(count);

  return (
    <div className="glass-bright rounded-2xl px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Eye size={15} style={{ color: accentHex }} />
        <span className="text-xs text-text-secondary">Pengunjung profil</span>
      </div>
      <span
        className="font-display font-semibold text-lg tabular-nums"
        style={{ color: accentHex }}
      >
        {animated.toLocaleString("id-ID")}
      </span>
    </div>
  );
}
