"use client";

import { motion } from "framer-motion";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  building: "Dibangun",
  planned: "Direncanakan",
};

export interface EcosystemNodeViewData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  url: string | null;
}

export default function EcosystemView({
  rootName,
  nodes,
}: {
  rootName: string;
  nodes: EcosystemNodeViewData[];
}) {
  return (
    <section id="ecosystem" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Ekosistem
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Satu identitas, beberapa sistem yang saling terhubung.
          </h2>
          <p className="mt-3 text-text-secondary text-sm max-w-md mx-auto">
            AKSA.ID bukan produk terpisah — ia adalah salah satu node dalam
            ekosistem yang sama.
          </p>
        </motion.div>

        {/* Root node */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-3"
        >
          <div className="glass rounded-xl px-6 py-3 glow-purple">
            <span className="font-display font-semibold text-sm text-text-primary uppercase">
              {rootName}
            </span>
          </div>
        </motion.div>

        {/* Connector line down */}
        <div className="flex justify-center" aria-hidden>
          <div className="w-px h-8 bg-gradient-to-b from-purple/50 to-transparent" />
        </div>

        {/* Node grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node, i) => {
            const statusKey = node.status.toLowerCase();
            const content = (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-text-primary text-[15px]">
                    {node.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-mono ${
                      statusKey === "active"
                        ? "text-online"
                        : statusKey === "building"
                          ? "text-blue"
                          : "text-text-tertiary"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        statusKey === "active"
                          ? "bg-online animate-pulse-dot"
                          : statusKey === "building"
                            ? "bg-blue animate-pulse-dot"
                            : "bg-text-tertiary"
                      }`}
                    />
                    {STATUS_LABEL[statusKey] ?? node.status}
                  </span>
                </div>
                {node.description && (
                  <p className="text-text-secondary text-[13px] leading-relaxed">
                    {node.description}
                  </p>
                )}
              </>
            );

            const cardClass =
              "group relative glass rounded-xl p-5 hover:border-purple/40 transition-colors block";

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
              >
                {node.url ? (
                  <a
                    href={node.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={cardClass}>{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
