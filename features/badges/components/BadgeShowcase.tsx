/**
 * features/badges/components/BadgeShowcase.tsx
 *
 * Menampilkan badge yang ditandai `featured` (docs/10-badge-system.md §3)
 * di halaman publik profil (docs/11-public-profile.md §5). Read-only —
 * equip/feature toggle hanya ada di dashboard (features/badges/components/
 * BadgeCard.tsx), bukan di sini.
 */

import { RARITY_GLOW, RARITY_LABEL, type Badge } from "../types";

export type ShowcaseBadge = Pick<Badge, "id" | "name" | "description" | "icon" | "rarity">;

interface BadgeShowcaseProps {
  badges: ShowcaseBadge[];
  className?: string;
}

export function BadgeShowcase({ badges, className = "" }: BadgeShowcaseProps) {
  if (badges.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap justify-center ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          title={`${badge.name} — ${badge.description}`}
          className={`h-9 w-9 rounded-full bg-purple/10 border border-purple/25 flex items-center justify-center text-purple text-xs font-semibold transition-transform duration-fast hover:scale-110 ${RARITY_GLOW[badge.rarity]}`}
          aria-label={`Badge: ${badge.name} (${RARITY_LABEL[badge.rarity]})`}
        >
          {badge.icon.slice(0, 1).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
