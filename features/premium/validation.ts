/**
 * features/premium/validation.ts
 * Validasi domain Credits (docs/12-premium-system.md §4).
 */

import { z } from "zod";

export const grantCreditsSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().int().positive().max(1_000_000),
  reason: z.string().min(4, "Alasan wajib diisi saat admin memberi credits.").max(280),
});

export type GrantCreditsInput = z.infer<typeof grantCreditsSchema>;
