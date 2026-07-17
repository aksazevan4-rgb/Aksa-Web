/**
 * features/feature-flags/validation.ts
 * Validasi domain Feature Flags (docs/14-admin-panel.md §8).
 */

import { z } from "zod";

export const createFlagSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9_-]+$/, "Key hanya boleh huruf kecil, angka, - dan _."),
  description: z.string().max(280).optional(),
});

export const updateFlagSchema = z.object({
  id: z.string().cuid(),
  enabled: z.boolean(),
  rolloutPercentage: z.number().int().min(0).max(100),
});

export type CreateFlagInput = z.infer<typeof createFlagSchema>;
export type UpdateFlagInput = z.infer<typeof updateFlagSchema>;
