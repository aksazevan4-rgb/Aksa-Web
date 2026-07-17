"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";

export interface TestimonialItem {
  name: string;
  role?: string;
  content: string;
  avatarUrl?: string;
}

interface Props {
  items: TestimonialItem[];
  accentHex?: string;
}

export function TestimonialsWidget({ items, accentHex = "#9b6dff" }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="glass rounded-2xl p-5 space-y-3"
        >
          <Quote size={16} style={{ color: accentHex }} className="opacity-60" />
          <p className="text-sm text-text-secondary leading-relaxed">{item.content}</p>
          <div className="flex items-center gap-2.5">
            {item.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.avatarUrl}
                alt={item.name}
                className="h-7 w-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ background: `${accentHex}40` }}
              >
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-text-primary">{item.name}</p>
              {item.role && <p className="text-[10px] text-text-tertiary">{item.role}</p>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
