"use client";

import { motion } from "framer-motion";
import {
  Blocks,
  Cpu,
  Layers,
  Palette,
  Radio,
  ShieldCheck,
  Sliders,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    title: "Tampilan yang bisa dikustomisasi penuh",
    description:
      "Pilih layout, background, font, warna, border, dan efek visual. Semua lewat dashboard — tidak perlu menyentuh kode.",
    color: "purple",
    glow: "rgba(155,109,255,0.15)",
  },
  {
    icon: Radio,
    title: "Discord real-time",
    description:
      "Tampilkan status online, aktivitas game, lagu Spotify, dan rich presence Discord secara live di profilmu.",
    color: "pink",
    glow: "rgba(232,121,249,0.15)",
  },
  {
    icon: Blocks,
    title: "Widget modular",
    description:
      "About, Skills, Projects, Status, Galeri, dan lebih banyak lagi. Aktifkan hanya yang kamu butuhkan, atur urutannya.",
    color: "emerald",
    glow: "rgba(52,211,153,0.12)",
  },
  {
    icon: Layers,
    title: "Layout system",
    description:
      "Classic, Modern, Glass, Minimal, Neon, Cyber — pilih karakter visual yang mencerminkan identitasmu.",
    color: "purple",
    glow: "rgba(155,109,255,0.15)",
  },
  {
    icon: Sliders,
    title: "Dashboard yang benar-benar lengkap",
    description:
      "Satu tempat untuk mengatur semua aspek profilmu. Tidak ada pengaturan yang tersembunyi di source code.",
    color: "blue",
    glow: "rgba(79,158,255,0.15)",
  },
  {
    icon: Zap,
    title: "Cepat dan ringan",
    description:
      "Profil publik dirender di server, dioptimasi untuk kecepatan. Loading cepat di semua perangkat dan koneksi.",
    color: "yellow",
    glow: "rgba(234,179,8,0.12)",
  },
  {
    icon: ShieldCheck,
    title: "Privasi dan keamanan",
    description:
      "Set profilmu publik atau private. Kontrol penuh atas data yang kamu tampilkan ke siapa.",
    color: "emerald",
    glow: "rgba(52,211,153,0.12)",
  },
  {
    icon: Cpu,
    title: "Dibangun untuk berkembang",
    description:
      "Arsitektur yang bersih dan extensible. Fitur baru bisa ditambahkan tanpa merombak sistem yang sudah ada.",
    color: "purple",
    glow: "rgba(155,109,255,0.15)",
  },
];

const colorMap: Record<string, string> = {
  purple: "text-purple bg-purple/10 border-purple/20",
  blue: "text-blue bg-blue/10 border-blue/20",
  pink: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  yellow: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 px-5">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-purple uppercase tracking-widest mb-4">
            Fitur Platform
          </p>
          <h2 className="font-display font-bold text-[clamp(1.8rem,5vw,3rem)] text-gradient leading-tight">
            Lebih dari sekadar link bio
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto text-[15px] leading-relaxed">
            Setiap fitur didesain untuk memberi kontrol nyata — bukan checkbox yang kelihatan di marketing tapi tidak berguna dalam praktiknya.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass rounded-2xl p-5 group hover:border-purple/25 transition-all duration-300 hover:-translate-y-1"
                style={{
                  boxShadow: `0 0 0 0 ${feature.glow}`,
                }}
                whileHover={{
                  boxShadow: `0 8px 32px -8px ${feature.glow}`,
                }}
              >
                <div
                  className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[feature.color]}`}
                >
                  <Icon size={18} />
                </div>
                <h3 className="font-display font-semibold text-text-primary text-sm leading-snug mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
