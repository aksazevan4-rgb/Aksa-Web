"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, MousePointerClick, Link2 } from "lucide-react";

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    let raf: number;

    function step(ts: number) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  active: boolean;
}

function StatCard({ icon: Icon, value, label, color, active }: StatCardProps) {
  const animated = useCountUp(value, active);

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 hover:border-purple/30 hover:-translate-y-0.5 ${color}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: "currentColor" }}
      />
      <div className="relative h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <p className="relative mt-3 text-xl sm:text-2xl font-display font-semibold text-text-primary tabular-nums leading-none">
        {animated.toLocaleString("id-ID")}
      </p>
      <p className="relative mt-1 text-xs text-text-tertiary">{label}</p>
    </div>
  );
}

interface Props {
  profileViews: number;
  totalClicks: number;
  linkCount: number;
}

export function DashboardStatsGrid({ profileViews, totalClicks, linkCount }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      <StatCard icon={Eye} value={profileViews} label="Profile Views" color="text-purple" active={inView} />
      <StatCard icon={MousePointerClick} value={totalClicks} label="Link Clicks" color="text-blue" active={inView} />
      <StatCard icon={Link2} value={linkCount} label="Total Link" color="text-emerald-400" active={inView} />
    </motion.div>
  );
}
