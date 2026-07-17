"use client";

import { motion } from "framer-motion";

export interface TechStackViewData {
  id: string;
  name: string;
  category: string | null;
}

export default function TechStackView({
  items,
}: {
  items: TechStackViewData[];
}) {
  if (items.length === 0) return null;

  return (
    <section id="stack" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Tech Stack
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Tools yang dipilih, bukan sekadar diikuti.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((tech, i) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className="group relative glass rounded-xl p-4 hover:border-purple/40 transition-colors cursor-default"
            >
              <p className="font-display font-medium text-text-primary text-sm mb-1">
                {tech.name}
              </p>
              {tech.category && (
                <p className="font-mono text-[11px] text-text-tertiary">
                  {tech.category}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
