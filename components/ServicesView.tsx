"use client";

import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

export interface ServiceViewData {
  id: string;
  title: string;
  description: string | null;
  
}

export default function ServicesView({
  services,
}: {
  services: ServiceViewData[];
}) {
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Layanan
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Yang bisa saya bantu kerjakan.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="glass rounded-xl p-5 hover:border-purple/40 transition-colors"
            >
              <div className="h-9 w-9 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center text-purple mb-4">
                <Sparkle size={16} />
              </div>
              <h3 className="font-display font-semibold text-text-primary text-[15px] mb-2">
                {service.title}
              </h3>
              <p className="text-text-secondary text-[13px] leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
