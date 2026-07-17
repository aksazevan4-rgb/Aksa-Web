"use client";

import { motion } from "framer-motion";
import { GitBranch, Globe, DollarSign, Gift } from "lucide-react";

function Discord({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M20.3 4.4A18.2 18.2 0 0 0 15.8 3l-.2.4c1.6.4 2.4 1 2.4 1a14.2 14.2 0 0 0-12 0s.8-.6 2.5-1L8.2 3a18.2 18.2 0 0 0-4.5 1.4C.9 8.5.2 12.5.6 16.5A18.4 18.4 0 0 0 6.2 19.4l.7-.9c-1.3-.4-2-.9-2-.9l.5-.3c3.8 1.8 7.9 1.8 11.6 0l.5.3s-.7.5-2 .9l.7.9a18.4 18.4 0 0 0 5.6-2.9c.5-4.6-.7-8.5-3.5-12.1ZM8.3 14.8c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Zm7.4 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2Z" />
    </svg>
  );
}

function Instagram({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YouTube({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <path d="M21.8 8.1c-.2-1.1-1.1-2-2.2-2.2C18 5.5 15.8 5.5 12 5.5s-6 .1-7.6.4C3.3 6.1 2.4 7 2.2 8.1 2 9.3 2 10.7 2 12s0 2.7.2 3.9c.2 1.1 1.1 2 2.2 2.2 1.6.3 3.8.4 7.6.4s6-.1 7.6-.4c1.1-.2 2-1.1 2.2-2.2.2-1.2.2-2.6.2-3.9s0-2.7-.2-3.9Z" fill="currentColor" />
      <path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="white" />
    </svg>
  );
}

function TikTokIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <path d="M14.5 3.25v11.1a4.9 4.9 0 1 1-4.9-4.9c.31 0 .61.03.9.08v2.98a2.04 2.04 0 1 0 1.02 1.77V3.25h2.98Z" fill="currentColor" />
      <path d="M14.5 3.25c.42 2.5 2.13 4.21 4.6 4.52v2.94c-1.78-.08-3.35-.73-4.6-1.82V3.25Z" fill="currentColor" opacity=".72" />
    </svg>
  );
}

function Shopping({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type IconComponent = (props: {
  size?: number;
  className?: string;
}) => React.ReactNode;

const ICONS: Record<string, IconComponent> = {
  website: Globe,
  discord: Discord,
  aksaId: Shopping,
  github: GitBranch,
  youtube: YouTube,
  tiktok: TikTokIcon,
  instagram: Instagram,
  saweria: DollarSign,
  bagibagi: Gift,
};

export interface ConnectLink {
  key: keyof typeof ICONS;
  label: string;
  url: string;
}

function shortDisplay(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function ConnectView({ links }: { links: ConnectLink[] }) {
  return (
    <section id="connect" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Terhubung
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Punya ide atau proyek? Mari bicara.
          </h2>
        </motion.div>

        {links.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-14">
            {links.map((item, i) => {
              const Icon = ICONS[item.key] ?? Globe;
              return (
                <motion.a
                  key={item.key}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -3 }}
                  className="flex flex-col items-center gap-2.5 glass rounded-xl p-5 text-center hover:border-purple/40 transition-colors min-h-[44px]"
                >
                  <Icon size={20} className="text-purple" />
                  <span className="font-medium text-text-primary text-sm">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-text-tertiary truncate max-w-full">
                    {shortDisplay(item.url)}
                  </span>
                </motion.a>
              );
            })}
          </div>
        )}

        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 text-center relative overflow-hidden"
        >
          <p className="font-display text-lg sm:text-xl text-text-primary italic mb-3">
            &ldquo;Konsisten dalam proses, fokus pada tujuan, dan terus
            berkembang.&rdquo;
          </p>
          <footer className="font-mono text-xs text-purple">— Aksa Zevan</footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
