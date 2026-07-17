/**
 * features/marketplace/validation.ts
 * Validasi domain Marketplace & Template (docs/13-marketplace-template.md).
 */

import { z } from "zod";

export const purchaseTemplateSchema = z.object({
  templateId: z.string().cuid(),
});

/** docs/13 §4 — review hanya boleh dari yang sudah pernah pakai template
 * (dicek kepemilikan di service.ts, bukan cukup lolos Zod ini saja). */
export const submitTemplateReviewSchema = z.object({
  templateId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(280).optional(),
});

export type SubmitTemplateReviewInput = z.infer<typeof submitTemplateReviewSchema>;
