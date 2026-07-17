"use client";

import { motion } from "framer-motion";

export interface SkillItem {
  label: string;
  category?: string;
  level?: number; // 1–5, optional
}

interface Props {
  skills: SkillItem[];
  accentHex?: string;
}

/**
 * components/profile/widgets/SkillsWidget.tsx
 * Skill tags grouped by category. Data stored in User.widgetConfig:
 *   { skills: { enabled: true, config: { items: SkillItem[] } } }
 */
export function SkillsWidget({ skills, accentHex = "#9b6dff" }: Props) {
  // Group by category
  const grouped: Record<string, SkillItem[]> = {};
  for (const skill of skills) {
    const cat = skill.category ?? "Skills";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-text-tertiary mb-2.5">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map((skill, i) => (
              <motion.span
                key={skill.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="inline-flex items-center rounded-full border border-border bg-white/4 px-3 py-1 text-xs text-text-secondary"
                style={skill.level ? { borderColor: `${accentHex}40` } : {}}
              >
                {skill.label}
                {skill.level ? (
                  <span className="ml-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span
                        key={j}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: j < skill.level! ? accentHex : "rgba(255,255,255,0.12)",
                        }}
                      />
                    ))}
                  </span>
                ) : null}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
