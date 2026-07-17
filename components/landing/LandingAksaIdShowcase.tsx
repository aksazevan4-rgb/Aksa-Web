"use client";

import { motion } from "framer-motion";
import { ExternalLink, MessageSquare, ShoppingBag, Star, Users } from "lucide-react";

interface Props {
  discordUrl: string | null;
  description: string | null;
}

const SERVICES = [
  { icon: MessageSquare, label: "Jasa Discord", desc: "Bot custom, setup server, komunitas" },
  { icon: ShoppingBag, label: "Aplikasi Premium", desc: "Tools dan sistem siap pakai" },
  { icon: Users, label: "Suntik Media Sosial", desc: "Followers, views, engagement" },
];

export default function LandingAksaIdShowcase({ discordUrl, description }: Props) {
  const discord = discordUrl ?? "https://discord.gg/aksaid";

  return (
    <section className="relative py-20 px-5">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div
            aria-hidden
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: "#5865f2" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-xs font-mono text-text-tertiary">Featured Project</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="font-display font-bold text-2xl text-text-primary mb-3">
                  AKSA.ID
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {description ??
                    "Platform layanan digital yang bergerak di bidang jasa Discord, penjualan aplikasi premium, dan suntik media sosial. Seluruh transaksi dan layanan dikelola eksklusif melalui komunitas Discord."}
                </p>

                <a
                  href={discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "#5865f2",
                    boxShadow: "0 0 24px -6px rgba(88,101,242,0.5)",
                  }}
                >
                  <MessageSquare size={15} />
                  Gabung Discord
                  <ExternalLink size={13} className="opacity-70" />
                </a>
              </div>

              <div className="space-y-3">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.label}
                      className="flex items-center gap-3 rounded-xl bg-white/4 border border-border px-4 py-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-[#5865f2]/15 border border-[#5865f2]/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-[#5865f2]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{service.label}</p>
                        <p className="text-xs text-text-tertiary">{service.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5">
              <Star size={11} className="text-yellow-400" />
              <p className="text-xs text-text-tertiary">
                Layanan AKSA.ID diumumkan melalui Discord resmi. Join untuk info terbaru.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
