"use client";

import { motion } from "framer-motion";

export interface TimelineItem {
  title: string;
  date?: string;
  description?: string;
}

interface Props {
  items: TimelineItem[];
  accentHex?: string;
}

/**
 * components/profile/widgets/TimelineWidget.tsx
 * Chronological list — career, education, milestones. Data stored in
 * User.widgetConfig: { timeline: { enabled: true, config: { items: TimelineItem[] } } }
 */
export function TimelineWidget({ items, accentHex = "#9b6dff" }: Props) {
  return (
    <div className="relative pl-6">
      <div
        className="absolute left-[7px] top-1.5 bottom-1.5 w-px"
        style={{ background: `linear-gradient(to bottom, ${accentHex}50, transparent)` }}
      />
      <div className="space-y-5">
        {items.map((item, i) => (
          <motion.div
            key={item.title + i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            <span
              className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-bg"
              style={{ background: accentHex }}
            />
            <div className="glass rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="font-medium text-sm text-text-primary">{item.title}</h3>
                {item.date && (
                  <span className="text-[10px] font-mono text-text-tertiary flex-shrink-0">{item.date}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">{item.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
