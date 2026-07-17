"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { hasFeatureAccess, type FeatureKey } from "@/lib/premium-features";
import { getProfileLayout, getProfileTheme, BORDER_STYLES, getProfileFont } from "@/lib/profile-themes";
import { BUILT_IN_TEMPLATES } from "@/lib/template-presets";
import { templatePurchaseService, MarketplaceServiceError } from "@/features/marketplace/server/service";
import type { Prisma, TemplateVisibility } from "@prisma/client";

/**
 * app/dashboard/profile/templates/actions.ts
 *
 * Fase 5 — Template Marketplace. Template berbayar (`price > 0`) sekarang
 * benar-benar ditagih lewat Credits system (docs/12 §4, docs/13 §3) via
 * features/marketplace/server/service.ts — bukan lagi murni informational.
 * Belum ada payment gateway (Stripe/QRIS) untuk MENGISI Credits itu sendiri;
 * itu tetap manual lewat admin untuk saat ini (lihat CreditsSection.tsx).
 */

/** Idempotent: call this before listing built-ins so they exist on first run. */
export async function ensureBuiltInTemplates() {
  for (const preset of BUILT_IN_TEMPLATES) {
    await prisma.profileTemplate.upsert({
      where: { slug: preset.slug },
      update: {}, // never overwrite if an admin has customized it in DB
      create: {
        slug: preset.slug,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        visibility: "PUBLIC",
        isBuiltIn: true,
        layoutKey: preset.layoutKey,
        themeKey: preset.themeKey,
        borderKey: preset.borderKey,
        fontKey: preset.fontKey,
        backgroundConfig: preset.backgroundConfig as Prisma.InputJsonValue,
        widgetConfig: Object.fromEntries(
          preset.widgets.map((w) => [w.key, { enabled: true, order: w.order }])
        ) as Prisma.InputJsonValue,
      },
    });
  }
}

export async function listPublicTemplates(category?: string) {
  await ensureBuiltInTemplates();
  return prisma.profileTemplate.findMany({
    where: {
      visibility: "PUBLIC",
      pendingReview: false,
      ...(category ? { category } : {}),
    },
    orderBy: [{ isBuiltIn: "desc" }, { useCount: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      isBuiltIn: true,
      price: true,
      useCount: true,
      layoutKey: true,
      themeKey: true,
      authorId: true,
      author: { select: { username: true, name: true } },
    },
  });
}

export async function listMyTemplates() {
  const session = await verifySession();
  return prisma.profileTemplate.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
}

/** Snapshot the caller's CURRENT profile look into a new saveable template. */
export async function saveCurrentProfileAsTemplate(name: string, description: string) {
  const session = await verifySession();

  const cleanName = name.trim().slice(0, 60);
  if (!cleanName) return { error: "Nama template tidak boleh kosong." };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      profileLayout: true,
      profileTheme: true,
      profileBorder: true,
      profileFont: true,
      profileAccentColor: true,
      profileBackground: true,
      widgetConfig: true,
    },
  });
  if (!dbUser) return { error: "User tidak ditemukan." };

  const created = await prisma.profileTemplate.create({
    data: {
      authorId: session.user.id,
      name: cleanName,
      description: description.trim().slice(0, 160) || null,
      category: "Custom",
      visibility: "PRIVATE",
      layoutKey: dbUser.profileLayout ?? "classic",
      themeKey: dbUser.profileTheme ?? "default",
      borderKey: dbUser.profileBorder,
      fontKey: dbUser.profileFont,
      accentColor: dbUser.profileAccentColor,
      backgroundConfig: (dbUser.profileBackground ?? undefined) as Prisma.InputJsonValue,
      widgetConfig: (dbUser.widgetConfig ?? undefined) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/profile/templates");
  return { success: true, id: created.id };
}

/** Apply a template (built-in, someone else's PUBLIC one, or the caller's
 * own) to the caller's live profile. Every premium-gated piece (layout,
 * theme, border, font) is re-checked against the caller's OWN plan here —
 * a template never grants access the caller's account doesn't already have.
 *
 * Fase 6 (docs/13-marketplace-template.md §3): kalau template ini berbayar
 * (`price > 0`) dan bukan milik caller sendiri, dibeli dulu pakai Credits
 * lewat templatePurchaseService — idempotent, jadi apply berikutnya tidak
 * ditagih ulang. */
export async function applyTemplate(templateId: string) {
  const session = await verifySession();

  const template = await prisma.profileTemplate.findUnique({ where: { id: templateId } });
  if (!template) return { error: "Template tidak ditemukan." };

  if (
    template.visibility === "PRIVATE" &&
    template.authorId !== session.user.id
  ) {
    return { error: "Template ini bersifat privat." };
  }

  if (template.visibility === "PUBLIC" && (template.price ?? 0) > 0) {
    try {
      await templatePurchaseService.purchase(session.user.id, templateId);
    } catch (error) {
      return { error: error instanceof MarketplaceServiceError ? error.message : "Gagal memproses pembelian." };
    }
  }

  const planCheck = { plan: session.user.plan ?? "FREE", role: session.user.role };

  const layout = getProfileLayout(template.layoutKey);
  if (layout.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(planCheck, layout.premiumFeatureKey as FeatureKey);
    if (!allowed) {
      return { error: `Layout "${layout.label}" pada template ini butuh Premium.` };
    }
  }

  const theme = getProfileTheme(template.themeKey);
  if (theme.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(planCheck, theme.premiumFeatureKey as FeatureKey);
    if (!allowed) {
      return { error: `Tema "${theme.label}" pada template ini butuh Premium.` };
    }
  }

  if (template.borderKey) {
    const border = BORDER_STYLES.find((b) => b.key === template.borderKey);
    if (border?.premiumFeatureKey) {
      const allowed = await hasFeatureAccess(planCheck, border.premiumFeatureKey as FeatureKey);
      if (!allowed) {
        return { error: `Border "${border.label}" pada template ini butuh Premium.` };
      }
    }
  }

  if (template.fontKey) {
    const font = getProfileFont(template.fontKey);
    if (font.premiumFeatureKey) {
      const allowed = await hasFeatureAccess(planCheck, font.premiumFeatureKey as FeatureKey);
      if (!allowed) {
        return { error: `Font "${font.label}" pada template ini butuh Premium.` };
      }
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileLayout: template.layoutKey,
        profileTheme: template.themeKey,
        profileBorder: template.borderKey,
        profileFont: template.fontKey,
        profileAccentColor: template.accentColor,
        profileBackground: template.backgroundConfig ?? undefined,
        widgetConfig: template.widgetConfig ?? undefined,
      },
    }),
    prisma.profileTemplate.update({
      where: { id: template.id },
      data: { useCount: { increment: 1 } },
    }),
  ]);

  revalidatePath("/dashboard/profile/appearance");
  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });
  if (owner?.username) revalidatePath(`/${owner.username}`);

  return { success: true };
}

export async function updateTemplateVisibility(
  templateId: string,
  visibility: TemplateVisibility
) {
  const session = await verifySession();

  const template = await prisma.profileTemplate.findUnique({
    where: { id: templateId },
    select: { authorId: true, isBuiltIn: true },
  });
  if (!template || template.authorId !== session.user.id) {
    return { error: "Template tidak ditemukan." };
  }
  if (template.isBuiltIn) {
    return { error: "Template bawaan tidak bisa diubah visibilitasnya." };
  }

  // docs/14-admin-panel.md §5 — kalau admin mengaktifkan moderasi, publish
  // ke PUBLIC tidak langsung tampil di listing publik sampai disetujui.
  // Kalau moderasi TIDAK diaktifkan (default), perilakunya persis seperti
  // sebelumnya: langsung publik.
  const siteConfig = await prisma.siteConfig.findUnique({
    where: { id: "config" },
    select: { requireTemplateModeration: true },
  });
  const needsReview = visibility === "PUBLIC" && siteConfig?.requireTemplateModeration === true;

  await prisma.profileTemplate.update({
    where: { id: templateId },
    data: { visibility, pendingReview: needsReview },
  });
  revalidatePath("/dashboard/profile/templates");
  return {
    success: true,
    pendingReview: needsReview,
  };
}

export async function deleteTemplate(templateId: string) {
  const session = await verifySession();

  const template = await prisma.profileTemplate.findUnique({
    where: { id: templateId },
    select: { authorId: true, isBuiltIn: true },
  });
  if (!template || template.authorId !== session.user.id) {
    return { error: "Template tidak ditemukan." };
  }
  if (template.isBuiltIn) {
    return { error: "Template bawaan tidak bisa dihapus." };
  }

  await prisma.profileTemplate.delete({ where: { id: templateId } });
  revalidatePath("/dashboard/profile/templates");
  return { success: true };
}
