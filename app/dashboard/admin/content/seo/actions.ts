"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
import { isSafeUrl } from "@/lib/validation";

interface ActionResult {
  error?: string;
  success?: boolean;
}

async function resolveOrCreateMedia(
  url: string,
  uploaderId: string
): Promise<string> {
  const existing = await prisma.media.findFirst({ where: { url } });
  if (existing) return existing.id;

  const created = await prisma.media.create({
    data: {
      url,
      resourceType: "image",
      uploaderId,
    },
  });
  return created.id;
}

export async function updateSettings(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const siteDescription = String(formData.get("siteDescription") ?? "").trim();
  const ogImageUrl = String(formData.get("ogImage") ?? "").trim();

  const socialFields = [
    "socialGithub",
    "socialDiscord",
    "socialWebsite",
    "socialSaweria",
    "socialYoutube",
    "socialTiktok",
    "socialInstagram",
    "socialBagibagi",
    "aksaIdDiscordUrl",
  ] as const;

  if (!siteTitle) return { error: "Site title wajib diisi." };
  if (!siteDescription) return { error: "Site description wajib diisi." };

  const socialValues: Record<string, string | null> = {};
  for (const field of socialFields) {
    const raw = String(formData.get(field) ?? "").trim();
    if (raw && !isSafeUrl(raw)) {
      return { error: `Link tidak valid: ${field}` };
    }
    socialValues[field] = raw || null;
  }

  if (ogImageUrl && !isSafeUrl(ogImageUrl)) {
    return { error: "URL OG Image tidak valid." };
  }
  const ogImageMediaId = ogImageUrl
    ? await resolveOrCreateMedia(ogImageUrl, session.user.id)
    : null;

  await prisma.settings.upsert({
    where: { id: "settings" },
    create: {
      id: "settings",
      siteTitle,
      siteDescription,
      ogImageMediaId,
      ...socialValues,
    },
    update: {
      siteTitle,
      siteDescription,
      ogImageMediaId,
      ...socialValues,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.SETTINGS_UPDATE,
      entityType: "Settings",
      entityId: "settings",
      metadata: { siteTitle },
    },
  });

  revalidatePath("/dashboard/admin/content/seo");
  revalidatePath("/");

  return { success: true };
}
