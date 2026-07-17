"use client";

import { motion } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";
import { PlanBadge } from "@/components/PlanBadge";
import Link from "next/link";
import { BarChart3, Globe2, MousePointerClick, TrendingUp, Users } from "lucide-react";

const ICON_MAP = {
  users: Users,
  "trending-up": TrendingUp,
  globe: Globe2,
  "mouse-pointer-click": MousePointerClick,
  "bar-chart": BarChart3,
} as const;

export type IconKey = keyof typeof ICON_MAP;

export interface StatItem {
  label: string;
  value: number;
  icon: IconKey;
  color: string;
}

interface TopProfile {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  plan: "FREE" | "PREMIUM";
  role: "ADMIN" | "USER";
  isFounder: boolean;
  profileViews: number;
  totalClicks: number;
}

interface Props {
  stats: StatItem[];
  recentUsers: number;
  topProfiles: TopProfile[];
  premiumRate: number;
}

export function AdminAnalyticsClient({ stats, recentUsers, topProfiles, premiumRate }: Props) {
  return (
    <div className="space-y-6">
      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color }, i) => {
          const Icon = ICON_MAP[icon];
          return (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5 space-y-3"
          >
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${color}`}>
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
        })}
      </div>

      {/* Secondary stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-3">
            Pendaftaran 30 Hari
          </p>
          <p className="text-3xl font-display font-bold text-text-primary tabular-nums">
            +{recentUsers.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-text-secondary mt-1">user baru bulan ini</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-3">
            Premium Conversion Rate
          </p>
          <p className="text-3xl font-display font-bold text-text-primary tabular-nums">
            {premiumRate.toFixed(1)}%
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-white/6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(premiumRate, 100)}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full bg-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Top profiles table */}
      {topProfiles.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">
              Top Profil — Views Tertinggi
            </h3>
          </div>

          <div className="divide-y divide-border/50">
            {topProfiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <span className="text-xs font-mono text-text-tertiary w-5 text-right flex-shrink-0">
                  {i + 1}
                </span>
                <UserAvatar
                  src={profile.image}
                  name={profile.name}
                  sizeClassName="h-8 w-8"
                  textClassName="text-xs"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {profile.name}
                    </p>
                    <PlanBadge user={profile} size="sm" />
                  </div>
                  {profile.username && (
                    <Link
                      href={`/${profile.username}`}
                      target="_blank"
                      className="text-xs text-text-tertiary hover:text-purple transition-colors"
                    >
                      @{profile.username}
                    </Link>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-text-primary tabular-nums">
                    {profile.profileViews.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-text-tertiary">views</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-text-primary tabular-nums">
                    {profile.totalClicks.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] text-text-tertiary">clicks</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
