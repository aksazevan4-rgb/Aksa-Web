"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getOnboardingPreset } from "@/lib/onboarding-presets";
import type { WidgetConfigMap } from "@/lib/widget-registry";

export async function completeOnboarding(profileTypeId: string) {
  const session = await verifySession();

  const preset = getOnboardingPreset(profileTypeId);
  if (!preset) {
    return { error: "Tipe profil tidak dikenali." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { widgetConfig: true },
  });

  const existingConfig =
    (existing?.widgetConfig as WidgetConfigMap | null) ?? {};

  // Merge preset widgets on top of any config the user might already have
  // (e.g. someone who reaches onboarding a second time after a reset)
  // rather than clobbering it outright.
  const mergedWidgetConfig: WidgetConfigMap = { ...existingConfig };
  for (const w of preset.widgets) {
    mergedWidgetConfig[w.key] = {
      ...(mergedWidgetConfig[w.key] ?? {}),
      enabled: true,
      order: w.order,
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      profileType: preset.id,
      profileLayout: preset.layoutKey,
      profileTheme: preset.themeKey,
      widgetConfig: mergedWidgetConfig as Prisma.InputJsonValue,
      onboardingCompleted: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/[username]", "page");
  redirect("/dashboard");
}

export async function skipOnboarding() {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
