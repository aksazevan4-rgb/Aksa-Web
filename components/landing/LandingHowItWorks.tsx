"use client";

import { motion } from "framer-motion";
import { UserPlus, Sliders, Share2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Daftar",
    description:
      "Buat akun dalam hitungan detik. Pilih username dan profilmu langsung aktif di aksa.gg/username.",
    color: "purple",
  },
  {
    number: "02",
    icon: Sliders,
    title: "Atur profilmu",
    description:
      "Pilih layout, pasang foto, tulis bio, hubungkan Discord, tambahkan widget dan link dari dashboard.",
    color: "pink",
  },
  {
    number: "03",
    icon: Share2,
    title: "Bagikan",
    description:
      "Satu link untuk semua. Tempel di bio media sosial, kartu nama digital, atau mana saja.",
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  purple: "text-purple border-purple/30 bg-purple/8",
  pink: "text-pink-400 border-pink-400/30 bg-pink-400/8",
  emerald: "text-emerald-400 border-emerald-400/30 bg-emerald-400/8",
};

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-5">
      {/* Ambient */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,158,255,0.2), transparent 70%)" }}
      />

      <div className="mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono text-blue uppercase tracking-widest mb-4">
            Cara Kerja
          </p>
          <h2 className="font-display font-bold text-[clamp(1.8rem,5vw,3rem)] text-gradient leading-tight">
            Mulai dalam tiga langkah
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto text-[15px]">
            Tidak ada setup yang rumit. Tidak ada konfigurasi yang bikin pusing.
          </p>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-10 left-[calc(33.33%+24px)] right-[calc(33.33%+24px)] h-px"
            style={{
              background: "linear-gradient(90deg, rgba(155,109,255,0.3), rgba(79,158,255,0.3), rgba(52,211,153,0.3))",
            }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative"
              >
                <div
                  className={`relative h-20 w-20 rounded-2xl border flex items-center justify-center mb-5 ${colorMap[step.color]}`}
                >
                  <Icon size={28} />
                  <span className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-surface border border-border flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-text-tertiary">
                      {step.number}
                    </span>
                  </span>
                </div>

                <h3 className="font-display font-semibold text-text-primary text-lg mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
