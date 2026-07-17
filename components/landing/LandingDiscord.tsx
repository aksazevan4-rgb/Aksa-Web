"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Music, Gamepad2, MonitorPlay, Radio } from "lucide-react";

function SpotifyMockup() {
  const [progress, setProgress] = useState(38);
  // Set on mount (in an effect), not during render, so the component stays pure.
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  useAnimationFrame(() => {
    if (startRef.current == null) return;
    const elapsed = (Date.now() - startRef.current) / 1000;
    setProgress(38 + (elapsed * 0.8) % 62);
  });

  return (
    <div className="glass-bright rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Music size={12} className="text-emerald-400" />
        <span className="text-[10px] font-mono text-emerald-400">Listening to Spotify</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500/30 to-blue/20 flex items-center justify-center flex-shrink-0 border border-emerald-400/20">
          <Music size={18} className="text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">Neon Lights</p>
          <p className="text-[11px] text-text-tertiary truncate">Daft Punk · Random Access Memories</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-text-tertiary">
          <span>{Math.floor(progress * 2.4 / 100 * 60)}:{String(Math.floor(progress * 2.4 % 60)).padStart(2, "0")}</span>
          <span>4:33</span>
        </div>
      </div>
    </div>
  );
}

function ActivityMockup() {
  return (
    <div className="glass-bright rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Gamepad2 size={12} className="text-blue" />
        <span className="text-[10px] font-mono text-blue">Playing a game</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue/30 to-purple/20 flex items-center justify-center flex-shrink-0 border border-blue/20">
          <Gamepad2 size={18} className="text-blue" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-text-primary">Valorant</p>
          <p className="text-[11px] text-text-tertiary">Competitive · Ascent</p>
          <p className="text-[10px] text-text-tertiary mt-0.5 font-mono">1:24:07 elapsed</p>
        </div>
      </div>
    </div>
  );
}

const STATUS_ITEMS = [
  { label: "Online", color: "#34d399", active: true },
  { label: "Idle", color: "#fbbf24", active: false },
  { label: "DND", color: "#ef4444", active: false },
  { label: "Offline", color: "#6b7280", active: false },
];

export default function LandingDiscord() {
  return (
    <section id="discord" className="relative py-24 px-5">
      <div
        aria-hidden
        className="absolute right-0 top-1/3 w-[400px] h-[400px] blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #5865f2, transparent 70%)" }}
      />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — visuals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4 order-2 lg:order-1"
          >
            {/* Status bar */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-mono text-text-tertiary mb-3">Discord Status</p>
              <div className="flex items-center gap-3">
                {STATUS_ITEMS.map((s) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border transition-all ${
                      s.active ? "bg-white/5 border-white/10" : "border-transparent opacity-40"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${s.active ? "animate-pulse-dot" : ""}`}
                      style={{ background: s.color }}
                    />
                    <span className="text-xs text-text-secondary">{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Radio size={11} className="text-text-tertiary" />
                <span className="text-[11px] text-text-tertiary font-mono">Coding on VS Code · 47 min</span>
              </div>
            </div>

            <SpotifyMockup />
            <ActivityMockup />
          </motion.div>

          {/* Right — copy */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <p className="text-xs font-mono text-[#5865f2] uppercase tracking-widest mb-4">
              Discord Integration
            </p>
            <h2 className="font-display font-bold text-[clamp(1.8rem,4vw,2.6rem)] text-gradient leading-tight">
              Profilmu hidup dengan Discord
            </h2>
            <p className="mt-4 text-text-secondary text-[15px] leading-relaxed">
              Hubungkan akun Discord dan profilmu otomatis menampilkan status online,
              lagu yang sedang diputar di Spotify, game yang sedang dimainkan, dan
              aktivitas lain secara real-time.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Radio,
                  label: "Status real-time",
                  desc: "Online, Idle, Do Not Disturb, Offline — sinkron otomatis.",
                },
                {
                  icon: Music,
                  label: "Spotify now playing",
                  desc: "Album art, judul lagu, artis, dan progress bar yang bergerak.",
                },
                {
                  icon: Gamepad2,
                  label: "Game activity",
                  desc: "Nama game, detail, durasi bermain, dan rich presence lainnya.",
                },
                {
                  icon: MonitorPlay,
                  label: "Aplikasi lain",
                  desc: "VS Code, YouTube, browser, dan semua app yang support rich presence.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#5865f2]/15 border border-[#5865f2]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#5865f2]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-tertiary leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-8 text-xs text-text-tertiary">
              Didukung oleh{" "}
              <a
                href="https://lanyard.rest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple hover:underline"
              >
                Lanyard API
              </a>{" "}
              — tidak perlu bot sendiri untuk memulai.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
