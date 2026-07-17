"use client";

import { Award } from "lucide-react";
import { motion } from "framer-motion";

export interface AchievementItem {
  title: string;
  description?: string;
  /** Single emoji or short glyph, e.g. "🏆". Falls back to a trophy icon. */
  icon?: string;
}

interface Props {
  items: AchievementItem[];
  accentHex?: string;
}

/**
 * components/profile/widgets/AchievementWidget.tsx
 * Grid of accomplishment badges. Data stored in User.widgetConfig:
 *   { achievement: { enabled: true, config: { items: AchievementItem[] } } }
 */
export function AchievementWidget({ items, accentHex = "#9b6dff" }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.title + i}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 text-center space-y-1.5"
        >
          <div
            className="mx-auto h-10 w-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: `${accentHex}18`, border: `1px solid ${accentHex}30` }}
          >
            {item.icon ? <span aria-hidden>{item.icon}</span> : <Award size={17} style={{ color: accentHex }} />}
          </div>
          <p className="text-xs font-medium text-text-primary leading-snug">{item.title}</p>
          {item.description && (
            <p className="text-[10px] text-text-tertiary leading-relaxed">{item.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
