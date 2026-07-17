"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Clock, Activity } from "lucide-react";

interface AboutViewProps {
  name: string;
  bioParagraphs: string[];
  location: string;
  timezone: string;
  status: string;
  avatarUrl: string | null;
}

export default function AboutView({
  name,
  bioParagraphs,
  location,
  timezone,
  status,
  avatarUrl,
}: AboutViewProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section id="about" className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start"
        >
          <div className="flex sm:flex-col items-center sm:items-start gap-4">
            {avatarUrl ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden flex-shrink-0 border border-purple/20">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl glass flex items-center justify-center font-display font-bold text-2xl text-purple flex-shrink-0">
                {initials}
              </div>
            )}
          </div>

          <div>
            <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
              Tentang
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary mb-5">
              Sistem yang tetap berjalan ketika tidak ada yang melihat.
            </h2>

            <div className="space-y-4 text-text-secondary text-[15px] leading-relaxed mb-6">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-text-tertiary font-mono">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-purple" />
                {location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-purple" />
                {timezone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Activity size={14} className="text-online" />
                {status}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
