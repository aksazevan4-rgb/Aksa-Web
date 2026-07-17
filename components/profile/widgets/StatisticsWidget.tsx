"use client";

/**
 * components/profile/widgets/StatisticsWidget.tsx
 * Kategori "Data & Utilitas" (docs/09-widget-system.md §3). Memakai
 * lib/hooks/useCountUp.ts yang sama dengan VisitorCountWidget — tidak
 * ada logic animasi duplikat (docs/18 §2).
 */

import { Eye, MousePointerClick, Award } from "lucide-react";
import { useCountUp } from "@/lib/hooks/useCountUp";

interface StatisticsWidgetProps {
  profileViews: number;
  totalLinkClicks: number;
  badgesCount: number;
  accentHex?: string;
}

function StatItem({
  icon,
  label,
  value,
  accentHex,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accentHex: string;
}) {
  const animated = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="flex items-center gap-1.5" style={{ color: accentHex }}>
        {icon}
        <span className="font-display font-semibold text-base tabular-nums">
          {animated.toLocaleString("id-ID")}
        </span>
      </div>
      <span className="text-[11px] text-text-tertiary">{label}</span>
    </div>
  );
}

export function StatisticsWidget({
  profileViews,
  totalLinkClicks,
  badgesCount,
  accentHex = "#9b6dff",
}: StatisticsWidgetProps) {
  return (
    <div className="glass-bright rounded-2xl px-4 py-4 flex items-stretch justify-between divide-x divide-border">
      <StatItem icon={<Eye size={14} />} label="Views" value={profileViews} accentHex={accentHex} />
      <StatItem
        icon={<MousePointerClick size={14} />}
        label="Klik"
        value={totalLinkClicks}
        accentHex={accentHex}
      />
      <StatItem icon={<Award size={14} />} label="Badge" value={badgesCount} accentHex={accentHex} />
    </div>
  );
}
