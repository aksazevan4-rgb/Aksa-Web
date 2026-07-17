/**
 * features/links/validation.ts
 *
 * Validasi untuk kapabilitas Link Management fase 4 (docs/08-link-management.md):
 * folder, pin, kategori, bulk actions, UTM, GEO restriction. Tidak
 * menduplikasi validasi field dasar (label/url/password) yang sudah ada
 * di lib/validation.ts (getProfileLinkError) — itu tetap dipakai apa adanya
 * oleh app/dashboard/profile/links/actions.ts (docs/18 §1: jangan duplikasi).
 */

import { z } from "zod";

export const ISO_COUNTRY_RE = /^[A-Z]{2}$/;

export const createFolderSchema = z.object({
  name: z.string().min(1, "Nama folder wajib diisi.").max(60),
});

export const renameFolderSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(60),
});

export const reorderFoldersSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export const assignLinkFolderSchema = z.object({
  linkId: z.string().cuid(),
  folderId: z.string().cuid().nullable(),
});

export const setLinkPinnedSchema = z.object({
  linkId: z.string().cuid(),
  pinned: z.boolean(),
});

export const setLinkCategorySchema = z.object({
  linkId: z.string().cuid(),
  category: z.string().max(40).nullable(),
});

export const utmParamsSchema = z.object({
  source: z.string().max(60).optional(),
  medium: z.string().max(60).optional(),
  campaign: z.string().max(60).optional(),
});

export const setLinkUtmSchema = z.object({
  linkId: z.string().cuid(),
  utmParams: utmParamsSchema.nullable(),
});

export const geoRestrictionSchema = z.object({
  mode: z.enum(["allow", "block"]),
  countries: z.array(z.string().regex(ISO_COUNTRY_RE)).max(50),
});

export const setLinkGeoSchema = z.object({
  linkId: z.string().cuid(),
  geoRestriction: geoRestrictionSchema.nullable(),
});

/** Bulk actions (docs/08 §5) — daftar id selalu divalidasi ulang di
 * service.ts terhadap kepemilikan user, tidak cukup hanya lolos Zod. */
export const bulkLinkIdsSchema = z.object({
  linkIds: z.array(z.string().cuid()).min(1).max(200),
});

export const bulkSetVisibilitySchema = z.object({
  linkIds: z.array(z.string().cuid()).min(1).max(200),
  visible: z.boolean(),
});

export const bulkSetCategorySchema = z.object({
  linkIds: z.array(z.string().cuid()).min(1).max(200),
  category: z.string().max(40).nullable(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type SetLinkGeoInput = z.infer<typeof setLinkGeoSchema>;
export type SetLinkUtmInput = z.infer<typeof setLinkUtmSchema>;
