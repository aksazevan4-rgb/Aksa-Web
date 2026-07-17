"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const PROFILE_PREVIEWS = [
  {
    name: "Aksa Zevan",
    username: "aksazevan",
    bio: "Discord Bot Developer & System Architect",
    status: "online" as const,
    statusText: "Building something new",
    avatar: "AZ",
    accentColor: "#9b6dff",
    links: ["Discord Server", "GitHub", "Portfolio"],
  },
  {
    name: "Reina Kuroda",
    username: "reinakuroda",
    bio: "UI/UX Designer × Creative Director",
    status: "idle" as const,
    statusText: "Designing in Figma",
    avatar: "RK",
    accentColor: "#4f9eff",
    links: ["Portofolio", "Behance", "Instagram"],
  },
  {
    name: "Daffa Rizky",
    username: "daffarizky",
    bio: "Full-Stack Developer · Open to collabs",
    status: "dnd" as const,
    statusText: "In a meeting",
    avatar: "DR",
    accentColor: "#34d399",
    links: ["Website", "LinkedIn", "GitHub"],
  },
];

const STATUS_COLORS = {
  online: "#34d399",
  idle: "#fbbf24",
  dnd: "#ef4444",
  offline: "#6b7280",
};

function ProfileCard({ profile, active }: { profile: (typeof PROFILE_PREVIEWS)[0]; active: boolean }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.96, y: active ? 0 : 12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 glass rounded-2xl p-5 flex flex-col gap-4"
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
          style={{ background: `${profile.accentColor}30`, border: `2px solid ${profile.accentColor}50` }}
        >
          {profile.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-text-primary text-sm">{profile.name}</p>
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: STATUS_COLORS[profile.status] }}
            />
          </div>
          <p className="text-xs text-text-tertiary">@{profile.username}</p>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">{profile.bio}</p>

      {/* Status */}
      <div className="glass-bright rounded-xl px-3 py-2 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse-dot flex-shrink-0"
          style={{ background: STATUS_COLORS[profile.status] }}
        />
        <span className="text-xs text-text-secondary font-mono">{profile.statusText}</span>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        {profile.links.map((link) => (
          <div
            key={link}
            className="rounded-xl border border-border bg-white/3 px-4 py-2.5 text-xs font-medium text-text-secondary text-center"
          >
            {link}
          </div>
        ))}
      </div>

      {/* Username footer */}
      <p className="text-center text-[10px] text-text-tertiary font-mono">
        aksa.gg/{profile.username}
      </p>
    </motion.div>
  );
}

export default function LandingHero() {
  const [activeProfile, setActiveProfile] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveProfile((i) => (i + 1) % PROFILE_PREVIEWS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden px-5 pt-28 pb-20"
    >
      {/* Ambient */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(155,109,255,0.4), rgba(79,158,255,0.15) 45%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(155,109,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(155,109,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono text-text-secondary mb-8"
            >
              <Sparkles size={11} className="text-purple" />
              Bukan link-in-bio kebanyakan
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display font-bold tracking-tight text-[clamp(2.4rem,7vw,5rem)] leading-[0.95] text-gradient"
            >
              Profilmu, tapi{" "}
              <span className="text-gradient-neon">benar-benar hidup.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 max-w-lg text-text-secondary text-[15px] leading-relaxed"
            >
              Status dan aktivitas Discord-mu tersinkron langsung ke profil —
              bukan bio statis yang diketik sekali lalu dilupakan. Tambahkan
              tema, widget, dan layout yang benar-benar kamu pakai, bukan
              sekadar daftar tautan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-purple px-6 py-3 text-sm font-medium text-white hover:bg-purple-dim transition-all glow-purple hover:-translate-y-0.5"
              >
                <Zap size={15} />
                Buat profil gratis
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-purple/30 transition-colors"
              >
                Lihat fitur
                <ArrowRight size={14} />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex items-center gap-6"
            >
              {[
                { value: "Free", label: "Untuk memulai" },
                { value: "Real-time", label: "Discord integration" },
                { value: "No-code", label: "Setup lewat dashboard" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display font-semibold text-text-primary text-sm">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-text-tertiary">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — live profile preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:block hidden"
          >
            <div className="relative mx-auto w-full max-w-sm">
              {/* Browser chrome */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/60 bg-white/3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                  <div className="ml-2 flex-1 glass rounded-md px-3 py-1">
                    <span className="text-[10px] font-mono text-text-tertiary">
                      aksa.gg/{PROFILE_PREVIEWS[activeProfile].username}
                    </span>
                  </div>
                </div>
                <div className="relative p-4" style={{ minHeight: 320 }}>
                  {PROFILE_PREVIEWS.map((profile, i) => (
                    <ProfileCard key={profile.username} profile={profile} active={i === activeProfile} />
                  ))}
                </div>
              </div>

              {/* Profile indicator dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {PROFILE_PREVIEWS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveProfile(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeProfile ? "w-6 bg-purple" : "w-1.5 bg-border"
                    }`}
                    aria-label={`Profile ${i + 1}`}
                  />
                ))}
              </div>

              {/* Floating decorative */}
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full orb orb-purple opacity-30 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full orb orb-pink opacity-20 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
