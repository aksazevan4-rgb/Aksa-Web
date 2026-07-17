/**
 * features/badges/types.ts
 *
 * Tipe diturunkan langsung dari Prisma Client — bukan didefinisikan ulang
 * manual, supaya tidak bisa drift dari schema (docs/18 §2: "strongly typed").
 */

import type { Badge, UserBadge, BadgeRarity, BadgeSource } from "@prisma/client";

export type { Badge, UserBadge, BadgeRarity, BadgeSource };

export type UserBadgeWithBadge = UserBadge & { badge: Badge };

export const RARITY_GLOW: Record<BadgeRarity, string> = {
  COMMON: "shadow-none",
  RARE: "shadow-[0_0_16px_-4px_rgba(56,189,248,0.45)]",
  EPIC: "shadow-[0_0_20px_-4px_rgba(99,102,241,0.5)]",
  LEGENDARY: "shadow-[0_0_24px_-4px_rgba(245,158,11,0.55)]",
  LIMITED: "shadow-[0_0_28px_-4px_rgba(99,102,241,0.5)]",
};

export const RARITY_LABEL: Record<BadgeRarity, string> = {
  COMMON: "Umum",
  RARE: "Langka",
  EPIC: "Epik",
  LEGENDARY: "Legendaris",
  LIMITED: "Edisi Terbatas",
};
