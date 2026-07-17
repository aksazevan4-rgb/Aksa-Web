"use client";

import { motion } from "framer-motion";

export interface ExperienceViewData {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
}

function formatRange(start: string, end: string | null, current: boolean) {
  const startLabel = new Date(start).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
  if (current || !end) return `${startLabel} — Sekarang`;
  const endLabel = new Date(end).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
  return `${startLabel} — ${endLabel}`;
}

export default function ExperienceView({
  entries,
}: {
  entries: ExperienceViewData[];
}) {
  if (entries.length === 0) return null;

  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Riwayat
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Jejak yang sudah dilalui.
          </h2>
        </motion.div>

        <div className="relative pl-8 sm:pl-10">
          {/* Garis vertikal timeline */}
          <div
            aria-hidden
            className="absolute left-[7px] sm:left-[9px] top-1 bottom-1 w-px bg-gradient-to-b from-purple/40 via-border to-transparent"
          />

          <div className="space-y-8">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative"
              >
                {/* Titik di garis timeline */}
                <span className="absolute -left-8 sm:-left-10 top-1.5 h-3.5 w-3.5 rounded-full bg-bg border-2 border-purple" />

                <p className="font-mono text-[11px] text-purple mb-1.5">
                  {formatRange(entry.startDate, entry.endDate, entry.current)}
                </p>
                <h3 className="font-display font-semibold text-text-primary text-[16px]">
                  {entry.role}
                </h3>
                {entry.company && (
                  <p className="text-text-tertiary text-[13px] mt-0.5">
                    {entry.company}
                  </p>
                )}
                <p className="text-text-secondary text-[13px] leading-relaxed mt-2">
                  {entry.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
