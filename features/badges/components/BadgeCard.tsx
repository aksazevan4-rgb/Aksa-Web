/**
 * features/badges/components/BadgeCard.tsx
 *
 * Desain kartu badge ORISINAL AKSA (docs/10-badge-system.md §2) — bukan
 * tiruan layout platform referensi manapun. Progress bar hanya tampil
 * untuk badge yang belum unlocked (docs/10 §2), dan requirement selalu
 * disertai angka konkret, bukan hanya persen visual (docs/10 §8,
 * docs/01-design-system.md §3.4 — aksesibilitas).
 */

import type { UserBadgeWithBadge } from "../types";
import { RARITY_GLOW, RARITY_LABEL } from "../types";

interface BadgeCardProps {
  userBadge: UserBadgeWithBadge;
  /** Progress lengkap "680/1000 klik" dsb — dihitung pemanggil dari
   * requirement badge, ditampilkan bila belum unlocked. */
  progressLabel?: string;
  onEquipToggle?: () => void;
  onFeatureToggle?: () => void;
}

export function BadgeCard({
  userBadge,
  progressLabel,
  onEquipToggle,
  onFeatureToggle,
}: BadgeCardProps) {
  const { badge, unlockedAt, progress, equipped, featured } = userBadge;
  const isUnlocked = Boolean(unlockedAt);

  return (
    <div
      className={`glass rounded-radius-lg p-4 space-y-3 transition-shadow duration-normal ${
        isUnlocked ? RARITY_GLOW[badge.rarity] : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-11 w-11 rounded-radius-md bg-purple/10 border border-purple/20 flex items-center justify-center text-purple text-lg font-semibold">
          {badge.icon.slice(0, 1).toUpperCase()}
        </div>
        <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
          {RARITY_LABEL[badge.rarity]}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-text-primary">{badge.name}</p>
        <p className="text-xs text-text-tertiary line-clamp-2">{badge.description}</p>
      </div>

      {!isUnlocked && (
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-purple transition-all duration-normal"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {progressLabel && (
            <p className="text-[11px] text-text-tertiary">{progressLabel}</p>
          )}
        </div>
      )}

      {isUnlocked && (onEquipToggle || onFeatureToggle) && (
        <div className="flex gap-2 pt-1">
          {onEquipToggle && (
            <button
              type="button"
              onClick={onEquipToggle}
              className={`flex-1 text-xs rounded-radius-sm px-2 py-1.5 border transition-colors duration-fast ${
                equipped
                  ? "border-purple/40 bg-purple/10 text-purple"
                  : "border-border text-text-secondary hover:border-purple/30"
              }`}
            >
              {equipped ? "Terpasang" : "Pasang"}
            </button>
          )}
          {onFeatureToggle && (
            <button
              type="button"
              onClick={onFeatureToggle}
              className={`flex-1 text-xs rounded-radius-sm px-2 py-1.5 border transition-colors duration-fast ${
                featured
                  ? "border-purple/40 bg-purple/10 text-purple"
                  : "border-border text-text-secondary hover:border-purple/30"
              }`}
            >
              {featured ? "Ditampilkan" : "Tampilkan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
