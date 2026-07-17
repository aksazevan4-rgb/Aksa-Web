/**
 * features/api-keys/validation.ts
 * Validasi domain API Key (docs/15-api-integrations.md §4, §6).
 */

import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(2, "Nama key wajib diisi.").max(60),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const revokeApiKeySchema = z.object({
  keyId: z.string().cuid(),
});
