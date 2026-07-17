"use client";

import { motion } from "framer-motion";

export interface StatViewData {
  id: string;
  label: string;
  value: string;
}

export default function StatsView({ stats }: { stats: StatViewData[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="relative px-5 py-16 sm:py-20 border-y border-border/60">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <p className="font-display font-bold text-3xl sm:text-4xl text-gradient">
                {stat.value}
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-text-tertiary uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
