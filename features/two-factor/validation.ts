/**
 * features/two-factor/validation.ts
 * Validasi domain 2FA/TOTP (docs/05-auth-system.md §2).
 */

import { z } from "zod";

export const totpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Kode harus 6 digit angka.");

export const confirmEnrollmentSchema = z.object({
  code: totpCodeSchema,
});

export const disableTwoFactorSchema = z.object({
  code: totpCodeSchema,
});
