"use client";

import { Heart } from "lucide-react";

export interface DonateLink {
  platform: "saweria" | "trakteer" | "paypal" | "custom";
  label: string;
  url: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  saweria: "#ff7043",
  trakteer: "#e05252",
  paypal: "#0070ba",
  custom: "#9b6dff",
};

export function DonateWidget({
  links,
  accentHex = "#9b6dff",
}: {
  links: DonateLink[];
  accentHex?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Heart size={14} style={{ color: accentHex }} />
        <p className="text-sm font-semibold text-text-primary">Dukung saya</p>
      </div>
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5"
          style={{
            background: PLATFORM_COLORS[link.platform] ?? accentHex,
            borderColor: "transparent",
          }}
        >
          <Heart size={13} />
          {link.label}
        </a>
      ))}
    </div>
  );
}
