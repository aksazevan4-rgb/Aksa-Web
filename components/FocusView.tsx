"use client";

import { motion } from "framer-motion";

export interface FocusViewData {
  id: string;
  title: string;
  description: string | null;
}

export default function FocusView({ items }: { items: FocusViewData[] }) {
  if (items.length === 0) return null;

  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Sedang Dikerjakan
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Yang sedang dibangun saat ini.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex gap-4 glass rounded-xl p-5 hover:border-purple/30 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-online animate-pulse-dot mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-display font-medium text-text-primary text-[15px] mb-1">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-[13px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
