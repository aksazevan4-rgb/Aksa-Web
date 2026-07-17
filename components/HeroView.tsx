"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EcosystemNodeStatus {
  id: string;
  name: string;
  status: "active" | "building" | "planned";
}

interface HeroViewProps {
  founderOf: string | null;
  name: string;
  roles: string[];
  ecosystemNodes: EcosystemNodeStatus[];
}

function useTypingEffect(words: string[], speed = 65, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const current = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), speed / 1.6);
    } else if (deleting && text.length === 0) {
      timeout = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, 0);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, speed, pause]);

  return text;
}

export default function HeroView({
  founderOf,
  name,
  roles,
  ecosystemNodes,
}: HeroViewProps) {
  const typed = useTypingEffect(roles);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden px-5 pt-28 pb-16"
    >
      {/* Ambient gradient glow */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.35), rgba(59,130,246,0.15) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl w-full text-center">
        {founderOf && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono text-text-secondary mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-online animate-pulse-dot" />
            </span>
            Founder of {founderOf}
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold tracking-tight text-[clamp(2.8rem,9vw,6rem)] leading-[0.95] text-gradient"
        >
          {name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 h-7 font-mono text-[clamp(0.95rem,2.5vw,1.25rem)] text-purple"
        >
          {typed}
          <span className="inline-block w-[2px] h-5 bg-purple ml-1 align-middle animate-pulse" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 max-w-xl mx-auto text-text-secondary text-[15px] leading-relaxed"
        >
          Membangun bot Discord, sistem otomatisasi, dan ekosistem digital
          yang dirancang untuk tetap stabil — bukan hanya untuk demo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#projects"
            className="rounded-full bg-purple px-6 py-3 text-sm font-medium text-white hover:bg-purple-dim transition-colors glow-purple"
          >
            Lihat Proyek
          </a>
          <a
            href="#connect"
            className="rounded-full glass px-6 py-3 text-sm font-medium text-text-primary hover:border-purple/40 transition-colors"
          >
            Hubungi Saya
          </a>
        </motion.div>
      </div>

      {/* Signature element: live system status strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.65 }}
        className="relative z-10 mx-auto mt-16 w-full max-w-3xl"
      >
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-2 font-mono text-[11px] text-text-tertiary">
              system-status — ecosystem.monitor
            </span>
          </div>
          <div className="p-4 font-mono text-[12px] sm:text-[13px] grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ecosystemNodes.map((node, i) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                    node.status === "active"
                      ? "bg-online animate-pulse-dot"
                      : node.status === "building"
                        ? "bg-blue animate-pulse-dot"
                        : "bg-text-tertiary"
                  }`}
                />
                <span className="text-text-secondary truncate">{node.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
