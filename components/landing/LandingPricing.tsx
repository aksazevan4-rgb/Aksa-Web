"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

const FREE_FEATURES = [
  "Profil publik dengan username",
  "Hingga 5 link button",
  "Discord status widget",
  "Layout Classic & Modern",
  "Background solid & gradient",
  "Social links (16 platform)",
  "Statistik dasar (views & clicks)",
  "SSL + CDN global",
];

const PREMIUM_FEATURES = [
  "Semua fitur Free",
  "Link button tanpa batas",
  "Semua layout (15+ pilihan)",
  "Background video & animated",
  "Discord activity real-time",
  "Spotify now playing",
  "Widget penuh (Skills, Projects, Gallery, dll)",
  "Custom CSS",
  "Analitik lanjutan dengan grafik",
  "Hapus \"Powered by AKSA\"",
  "Priority support",
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 px-5">
      <div
        aria-hidden
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[500px] h-[300px] blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(155,109,255,0.5), transparent 70%)" }}
      />

      <div className="mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-mono text-purple uppercase tracking-widest mb-4">
            Harga
          </p>
          <h2 className="font-display font-bold text-[clamp(1.8rem,5vw,3rem)] text-gradient leading-tight">
            Mulai gratis, upgrade kapan saja
          </h2>
          <p className="mt-4 text-text-secondary max-w-lg mx-auto text-[15px]">
            Tidak ada kartu kredit yang dibutuhkan untuk memulai. Upgrade ke Premium
            jika kamu butuh lebih banyak.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-7 flex flex-col"
          >
            <div className="mb-6">
              <p className="text-xs font-mono text-text-tertiary uppercase tracking-widest mb-1">Free</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-4xl text-text-primary">Rp 0</span>
                <span className="text-sm text-text-tertiary">/ bulan</span>
              </div>
              <p className="text-sm text-text-tertiary mt-2">Untuk memulai, selalu gratis.</p>
            </div>

            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-8 block text-center rounded-xl glass border border-border px-5 py-3 text-sm font-medium text-text-primary hover:border-purple/30 transition-colors"
            >
              Mulai gratis
            </Link>
          </motion.div>

          {/* Premium */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-2xl p-7 flex flex-col overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(155,109,255,0.14) 0%, rgba(232,121,249,0.09) 100%)",
              border: "1px solid rgba(155,109,255,0.3)",
              boxShadow: "0 0 40px -12px rgba(232,121,249,0.3)",
            }}
          >
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple/20 border border-purple/30 px-2.5 py-0.5 text-[10px] font-mono text-purple">
                <Zap size={9} />
                Populer
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-mono text-purple uppercase tracking-widest mb-1">Premium</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-4xl text-gradient-purple">
                  Rp&nbsp;29k
                </span>
                <span className="text-sm text-text-tertiary">/ bulan</span>
              </div>
              <p className="text-sm text-text-tertiary mt-2">
                Semua yang ada di Free, ditambah lebih banyak.
              </p>
            </div>

            <ul className="space-y-3 flex-1">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check size={15} className="text-purple mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-8 block text-center rounded-xl bg-purple px-5 py-3 text-sm font-medium text-white hover:bg-purple-dim transition-all glow-purple"
            >
              Coba Premium
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-xs text-text-tertiary mt-8"
        >
          Harga dikelola admin dan dapat berubah. Feature Premium ditentukan dari dashboard admin — tanpa update kode.
        </motion.p>
      </div>
    </section>
  );
}
