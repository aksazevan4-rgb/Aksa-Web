"use client";

import { motion } from "framer-motion";
import { Eye, MousePointerClick, TrendingUp, Link2 } from "lucide-react";
import { LinkIcon } from "@/components/LinkIcon";

interface LinkData {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  clicks: number;
  visible: boolean;
}

interface Props {
  profileViews: number;
  totalClicks: number;
  links: LinkData[];
  hasAdvanced: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-text-primary tabular-nums">
          {value.toLocaleString("id-ID")}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export function AnalyticsClient({ profileViews, totalClicks, links, hasAdvanced }: Props) {
  const ctr =
    profileViews > 0 ? ((totalClicks / profileViews) * 100).toFixed(1) : "0.0";

  const maxClicks = Math.max(...links.map((l) => l.clicks), 1);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Eye}
          label="Profile Views"
          value={profileViews}
          color="bg-purple/10 border border-purple/20 text-purple"
          delay={0}
        />
        <StatCard
          icon={MousePointerClick}
          label="Total Link Clicks"
          value={totalClicks}
          color="bg-blue/10 border border-blue/20 text-blue"
          delay={0.08}
        />
        <div className="glass rounded-2xl p-5 flex flex-col gap-3 col-span-2 sm:col-span-1">
          <div className="h-10 w-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-text-primary tabular-nums">
              {ctr}%
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">Click-through Rate</p>
          </div>
        </div>
      </div>

      {/* Per-link breakdown */}
      {links.length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Link2 size={15} className="text-text-tertiary" />
            <h3 className="text-sm font-semibold text-text-primary">Performa per Link</h3>
          </div>

          <div className="grid xl:grid-cols-2 gap-x-8 gap-y-3">
            {links.map((link, i) => {
              const pct = maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0;
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <LinkIcon icon={link.icon} size={13} className="text-text-tertiary flex-shrink-0" />
                      <span className="text-xs text-text-secondary truncate">{link.label}</span>
                      {!link.visible && (
                        <span className="text-[10px] text-text-tertiary bg-white/5 border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                          Hidden
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-text-primary tabular-nums flex-shrink-0">
                      {link.clicks.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                      className="h-full rounded-full bg-purple"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced analytics placeholder */}
      {hasAdvanced && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Traffic Harian</h3>
          <p className="text-xs text-text-tertiary">
            Data grafik harian akan tersedia setelah sistem pencatatan harian diaktifkan.
            Tambahkan model <code className="font-mono text-purple">ProfileViewLog</code> ke
            schema dan jalankan migrasi untuk mengaktifkan fitur ini.
          </p>
          <DailyChartPlaceholder />
        </div>
      )}
    </div>
  );
}

/**
 * Placeholder chart — replace with real data once ProfileViewLog model
 * is migrated and daily view counts are recorded.
 */
function DailyChartPlaceholder() {
  const bars = [22, 35, 18, 48, 31, 55, 40, 28, 60, 45, 33, 52, 38, 65];
  const max = Math.max(...bars);

  return (
    <div className="h-32 flex items-end gap-1">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(h / max) * 100}%` }}
          transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
          className="flex-1 rounded-t-sm bg-purple/40"
        />
      ))}
    </div>
  );
}
