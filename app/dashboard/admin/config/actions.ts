"use server";

import { verifyAdmin } from "@/lib/dal";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateSiteConfig(_prevState: unknown, formData: FormData) {
  const session = await verifyAdmin();

  const data = {
    siteName: String(formData.get("siteName") ?? "AKSA"),
    siteUrl: String(formData.get("siteUrl") ?? ""),
    siteTitle: String(formData.get("siteTitle") ?? ""),
    siteDescription: String(formData.get("siteDescription") ?? ""),
    allowRegistration: formData.get("allowRegistration") === "on",
    maintenanceMode: formData.get("maintenanceMode") === "on",
    poweredByVisible: formData.get("poweredByVisible") === "on",
    requireTemplateModeration: formData.get("requireTemplateModeration") === "on",
    showAksaIdShowcase: formData.get("showAksaIdShowcase") === "on",
    aksaIdDiscordUrl: String(formData.get("aksaIdDiscordUrl") ?? "") || null,
    aksaIdDescription: String(formData.get("aksaIdDescription") ?? "") || null,
    socialGithub: String(formData.get("socialGithub") ?? "") || null,
    socialDiscord: String(formData.get("socialDiscord") ?? "") || null,
    socialInstagram: String(formData.get("socialInstagram") ?? "") || null,
    socialYoutube: String(formData.get("socialYoutube") ?? "") || null,
    socialTiktok: String(formData.get("socialTiktok") ?? "") || null,
    socialWebsite: String(formData.get("socialWebsite") ?? "") || null,
  };

  await prisma.siteConfig.upsert({
    where: { id: "config" },
    create: { id: "config", ...data },
    update: data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.SETTINGS_UPDATE,
      entityType: "SiteConfig",
      entityId: "config",
      metadata: data,
    },
  });

  revalidateTag("site-config", "max");
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/admin/config");

  return { success: true };
}
