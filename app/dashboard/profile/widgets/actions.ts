"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { hasFeatureAccess, type FeatureKey } from "@/lib/premium-features";

export async function saveWidgetContent(
  widgetKey: string,
  content: Record<string, unknown>
) {
  const session = await verifySession();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { widgetConfig: true, plan: true, role: true },
  });

  const existing =
  (dbUser?.widgetConfig as Record<
    string,
    {
      enabled?: boolean;
      order?: number;
      config?: Prisma.InputJsonValue;
    }
  > | null) ?? {};

  // Check premium gate from DB (never trust client)
  const premiumGates: Record<string, string> = {
    skills: "widget_skills",
    projects: "widget_projects",
    gallery: "widget_gallery",
    testimonials: "widget_testimonials",
    donate: "widget_donate",
    timeline: "widget_timeline",
    achievement: "widget_achievement",
    faq: "widget_faq",
    embed: "widget_embed",
    "custom-html": "widget_custom_html",
    "discord-activity": "widget_discord_activity",
    spotify: "widget_spotify",
    // Fase Widget System lanjutan (docs/09 §3) — sebelumnya cuma terdaftar
    // di lib/widget-registry.ts tanpa gate di sini, celah kecil yang
    // ditemukan & diperbaiki saat menambahkan config editor-nya.
    statistics: "widget_statistics",
    "github-graph": "widget_github_graph",
    "crypto-ticker": "widget_crypto_ticker",
    "rss-feed": "widget_rss_feed",
  };

  const requiredFeature = premiumGates[widgetKey];
  if (requiredFeature) {
    const allowed = await hasFeatureAccess(
      { plan: dbUser?.plan ?? "FREE", role: dbUser?.role ?? "USER" },
      requiredFeature as FeatureKey
    );
    if (!allowed) return { error: "Widget ini membutuhkan Premium." };
  }

  const updated = {
    ...existing,
    [widgetKey]: {
      ...(existing[widgetKey] ?? {}),
      config: content as Prisma.InputJsonValue,
    },
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { widgetConfig: updated },
  });

  revalidatePath("/dashboard/profile/widgets");
  revalidatePath("/[username]", "page");
  return { success: true };
}
