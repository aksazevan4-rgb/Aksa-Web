/**
 * features/badges/validation.ts
 *
 * Satu-satunya sumber aturan validasi untuk domain Badge — dipakai baik
 * di Server Action (features/badges/server/actions.ts) maupun di form
 * Admin (React Hook Form resolver), sesuai docs/03-backend-architecture.md
 * §7 ("Zod sebagai satu-satunya sumber validasi").
 */

import { z } from "zod";

export const BADGE_CATEGORIES = [
  "staff",
  "verified",
  "premium",
  "donator",
  "developer",
  "early-supporter",
  "community-helper",
  "moderator",
  "bug-hunter",
  "partner",
  "creator",
  "achievement",
  "event",
  "limited",
  "custom",
] as const;

/** Bentuk requirement yang dipahami badge evaluator (docs/03 §4). Setiap
 * tipe baru wajib ditambahkan di sini dulu — jangan biarkan Badge.requirement
 * menerima bentuk JSON bebas yang tidak divalidasi. */
export const badgeRequirementSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("linkClicksTotal"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("accountAgeDays"), threshold: z.number().int().positive() }),
  z.object({ type: z.literal("purchase"), priceCredits: z.number().int().positive() }),
  z.object({ type: z.literal("adminGrant") }),
  z.object({ type: z.literal("eventParticipation"), eventKey: z.string().min(1) }),
]);

export const createBadgeSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Key hanya boleh huruf kecil, angka, dan tanda hubung."),
  name: z.string().min(2).max(80),
  description: z.string().min(4).max(280),
  category: z.enum(BADGE_CATEGORIES),
  icon: z.string().min(1),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY", "LIMITED"]).default("COMMON"),
  requirement: badgeRequirementSchema.nullable().optional(),
  isAnimated: z.boolean().default(false),
  isPurchasable: z.boolean().default(false),
  priceCredits: z.number().int().positive().nullable().optional(),
  availableFrom: z.coerce.date().nullable().optional(),
  availableUntil: z.coerce.date().nullable().optional(),
});

export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;

export const grantBadgeSchema = z.object({
  userId: z.string().cuid(),
  badgeId: z.string().cuid(),
  reason: z.string().min(4, "Alasan wajib diisi saat admin memberikan badge.").max(280),
});

export type GrantBadgeInput = z.infer<typeof grantBadgeSchema>;

export const equipBadgeSchema = z.object({
  badgeId: z.string().cuid(),
  equipped: z.boolean(),
});

export const featureBadgeSchema = z.object({
  badgeId: z.string().cuid(),
  featured: z.boolean(),
});

/** Batas featured badge per plan (docs/10 §3) — FREE lebih sedikit dari
 * PREMIUM, dicek di service.ts sebelum menyimpan featured=true. */
export const MAX_FEATURED_BADGES = { FREE: 3, PREMIUM: 8 } as const;
