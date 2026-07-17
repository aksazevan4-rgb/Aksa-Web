"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// Mock showcase profiles for the landing page
const SHOWCASE_PROFILES = [
  {
    name: "Aksa Zevan",
    username: "aksazevan",
    bio: "Discord Bot Developer",
    avatar: "AZ",
    bg: "from-purple/30 to-blue/20",
    status: "online",
    links: 8,
    views: "2.4k",
  },
  {
    name: "Reina Kuroda",
    username: "reinakuroda",
    bio: "UI/UX Designer",
    avatar: "RK",
    bg: "from-pink-500/30 to-purple/20",
    status: "idle",
    links: 6,
    views: "1.8k",
  },
  {
    name: "Daffa Rizky",
    username: "daffarizky",
    bio: "Full-Stack Developer",
    avatar: "DR",
    bg: "from-emerald-500/30 to-blue/20",
    status: "online",
    links: 12,
    views: "3.1k",
  },
];

const STATUS_COLORS: Record<string, string> = {
  online: "#34d399",
  idle: "#fbbf24",
};

export default function LandingProfiles() {
  return (
    <section className="relative py-20 px-5">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-4">
            Community
          </p>
          <h2 className="font-display font-bold text-[clamp(1.8rem,5vw,3rem)] text-gradient leading-tight">
            Profil yang dibuat di AKSA
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5">
          {SHOWCASE_PROFILES.map((profile, i) => (
            <motion.div
              key={profile.username}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden group hover:border-purple/25 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Banner */}
              <div className={`h-20 bg-gradient-to-br ${profile.bg} relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
              </div>

              <div className="px-5 pb-5 -mt-8 relative">
                <div className="relative inline-block">
                  <div className="h-14 w-14 rounded-full bg-surface border-2 border-bg flex items-center justify-center font-display font-bold text-lg text-text-primary">
                    {profile.avatar}
                  </div>
                  <span
                    className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg"
                    style={{ background: STATUS_COLORS[profile.status] }}
                  />
                </div>

                <div className="mt-2">
                  <p className="font-display font-semibold text-text-primary text-sm">{profile.name}</p>
                  <p className="text-xs text-text-tertiary">@{profile.username}</p>
                  <p className="text-xs text-text-secondary mt-1.5">{profile.bio}</p>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{profile.links}</p>
                    <p className="text-[10px] text-text-tertiary">links</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{profile.views}</p>
                    <p className="text-[10px] text-text-tertiary">views</p>
                  </div>
                  <Link
                    href="/register"
                    className="ml-auto text-[10px] text-purple hover:underline flex items-center gap-1"
                  >
                    Buat profilmu <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
