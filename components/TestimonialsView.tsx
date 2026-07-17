"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export interface TestimonialViewData {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
}

export default function TestimonialsView({
  testimonials,
}: {
  testimonials: TestimonialViewData[];
}) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  function next() {
    setIndex((i) => (i + 1) % testimonials.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }

  return (
    <section className="relative px-5 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="font-mono text-xs text-purple tracking-widest uppercase mb-3">
            Testimoni
          </p>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Apa kata mereka yang sudah bekerja sama.
          </h2>
        </motion.div>

        <div className="relative glass rounded-2xl p-8 sm:p-10 min-h-[220px] flex items-center">
          <Quote
            size={36}
            className="absolute top-6 left-6 text-purple/15"
            aria-hidden
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35 }}
              className="text-center w-full"
            >
              {current.avatarUrl && (
                <div className="relative h-12 w-12 rounded-full overflow-hidden mx-auto mb-4 bg-white/5">
                  <Image
                    src={current.avatarUrl}
                    alt={current.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-text-secondary text-[15px] leading-relaxed mb-5">
                &ldquo;{current.content}&rdquo;
              </p>
              <p className="font-display font-medium text-text-primary text-sm">
                {current.name}
              </p>
              {current.role && (
                <p className="text-text-tertiary text-xs mt-0.5">
                  {current.role}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              aria-label="Testimoni sebelumnya"
              className="h-9 w-9 flex items-center justify-center rounded-full glass text-text-secondary hover:text-purple hover:border-purple/40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Testimoni ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-purple" : "w-1.5 bg-white/15"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Testimoni berikutnya"
              className="h-9 w-9 flex items-center justify-center rounded-full glass text-text-secondary hover:text-purple hover:border-purple/40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
