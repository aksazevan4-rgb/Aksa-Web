"use server";

import { verifySession } from "@/lib/dal";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hasFeatureAccess, type FeatureKey } from "@/lib/premium-features";
import { PROFILE_LAYOUTS, BACKGROUND_PREMIUM_REQUIREMENT, BACKGROUND_TYPE_LABELS, BORDER_STYLES, PROFILE_FONTS, type BackgroundType } from "@/lib/profile-themes";
import { WIDGET_REGISTRY, type WidgetConfigMap } from "@/lib/widget-registry";

interface ActionState {
  success?: boolean;
  error?: string;
}

export async function updateProfileBorder(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const borderKey = String(formData.get("border") ?? "none");

  const border = BORDER_STYLES.find((b) => b.key === borderKey);
  if (!border) {
    return { error: "Border tidak valid." };
  }

  // Gate check — never trust client-side disabling alone.
  if (border.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      border.premiumFeatureKey as FeatureKey
    );
    if (!allowed) {
      return { error: "Border ini butuh Premium." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileBorder: borderKey },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

export async function updateProfileLayout(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const layoutKey = String(formData.get("layout") ?? "classic");

  const layout = PROFILE_LAYOUTS.find((l) => l.key === layoutKey);
  if (!layout) {
    return { error: "Layout tidak valid." };
  }

  // Gate check — never trust client-side disabling alone.
  if (layout.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      layout.premiumFeatureKey as FeatureKey
    );
    if (!allowed) {
      return { error: "Layout ini butuh Premium." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileLayout: layoutKey },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

export async function updateProfileBackground(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const type = String(formData.get("bgType") ?? "gradient") as BackgroundType;
  const colorsRaw = String(formData.get("bgColors") ?? "");
  const mediaUrl = String(formData.get("bgMediaUrl") ?? "") || undefined;

  if (!(type in BACKGROUND_TYPE_LABELS)) {
    return { error: "Tipe background tidak valid." };
  }

  const requiredFeature = BACKGROUND_PREMIUM_REQUIREMENT[type];
  if (requiredFeature) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      requiredFeature as FeatureKey
    );
    if (!allowed) {
      return { error: "Tipe background ini butuh Premium." };
    }
  }

  const colors = colorsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      profileBackground: {
        type,
        colors: colors.length ? colors : undefined,
        mediaUrl,
      },
    },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/**
 * Toggle a single widget on/off and update its order. Re-checks premium
 * access server-side regardless of what the client sent.
 */
export async function toggleWidget(widgetKey: string, enabled: boolean) {
  const session = await verifySession();

  const widget = WIDGET_REGISTRY.find((w) => w.key === widgetKey);
  if (!widget) return { error: "Widget tidak ditemukan." };

  if (enabled && widget.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      widget.premiumFeatureKey as FeatureKey
    );

    if (!allowed) {
      return { error: "Widget ini butuh Premium." };
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      widgetConfig: true,
    },
  });

  const current =
    (dbUser?.widgetConfig as WidgetConfigMap | null) ?? {};

  const updated: WidgetConfigMap = {
    ...current,
    [widgetKey]: {
      ...(current[widgetKey] ?? {}),
      enabled,
      order: current[widgetKey]?.order ?? widget.defaultOrder,
    },
  };

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      widgetConfig: updated as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");

  return { success: true };
}

/** Reorder widgets — receives full ordered list of widget keys. */
export async function reorderWidgets(orderedKeys: string[]) {
  const session = await verifySession();

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { widgetConfig: true },
  });

  const current = (dbUser?.widgetConfig ?? {}) as WidgetConfigMap;
  const updated: WidgetConfigMap = { ...current };

  orderedKeys.forEach((key, index) => {
    const widget = WIDGET_REGISTRY.find((w) => w.key === key);
    updated[key] = {
      ...(current[key] ?? {}),
      enabled: current[key]?.enabled ?? widget?.defaultEnabled ?? false,
      order: index,
    };
  });

  await prisma.user.update({
  where: {
    id: session.user.id,
  },
  data: {
    widgetConfig: updated as Prisma.InputJsonValue,
  },
});
  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/** Set (or clear, with `url = null`) the profile avatar shown everywhere
 * (navbar, public profile, badges). File itself is uploaded beforehand via
 * uploadOwnMedia — mirrors updateCustomCursor's instant-save pattern so the
 * unified Media Profil panel can save each asset the moment it's uploaded,
 * without going through the full "Profil Saya" form. */
export async function updateAvatarUrl(url: string | null) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: url },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/dashboard/profile");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/** Set (or clear, with `url = null`) the profile banner image. Same
 * instant-save pattern as updateAvatarUrl. */
export async function updateBannerUrl(url: string | null) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bannerImage: url },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/dashboard/profile");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/**
 * Quick instant-save background setter for the unified Media Profil panel
 * — just "upload a file, it's live" for image/video, no type/color form.
 * The full BackgroundPicker (solid/gradient/aurora/etc + its own
 * image/video mode) still writes through updateProfileBackground above;
 * both end up in the same User.profileBackground column so either entry
 * point stays in sync with the other.
 */
export async function updateBackgroundMedia(url: string | null, kind: "image" | "video") {
  const session = await verifySession();

  if (url) {
    const requiredFeature = BACKGROUND_PREMIUM_REQUIREMENT[kind];
    if (requiredFeature) {
      const allowed = await hasFeatureAccess(
        { plan: session.user.plan ?? "FREE", role: session.user.role },
        requiredFeature as FeatureKey
      );
      if (!allowed) {
        return { error: `Background ${kind === "video" ? "video" : "gambar"} ini butuh Premium.` };
      }
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      profileBackground: url
        ? { type: kind, mediaUrl: url }
        : Prisma.JsonNull,
    },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/** Set (or clear, with `url = null`) the custom PNG cursor shown on the
 * public profile. File itself is uploaded beforehand via uploadOwnMedia. */
export async function updateCustomCursor(url: string | null) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { customCursorUrl: url },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

/** Set (or clear, with `url = null`) the background audio track played on
 * the public profile. File itself is uploaded beforehand via uploadOwnMedia. */
export async function updateBackgroundAudio(url: string | null) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { backgroundAudioUrl: url },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

interface ProfileEffectsInput {
  cardOpacity: number;
  cardBlur: number;
  glowUsername: boolean;
  glowSocials: boolean;
  glowBadges: boolean;
}

/** Save opacity / blur / glow-toggle preferences for the public profile card. */
export async function updateProfileEffects(effects: ProfileEffectsInput) {
  const session = await verifySession();

  const clamped: ProfileEffectsInput = {
    cardOpacity: Math.min(100, Math.max(0, effects.cardOpacity)),
    cardBlur: Math.min(80, Math.max(0, effects.cardBlur)),
    glowUsername: !!effects.glowUsername,
    glowSocials: !!effects.glowSocials,
    glowBadges: !!effects.glowBadges,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileEffects: clamped as unknown as Prisma.InputJsonValue },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}

export async function updateProfileFont(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const fontKey = String(formData.get("font") ?? "inter");

  const font = PROFILE_FONTS.find((f) => f.key === fontKey);
  if (!font) {
    return { error: "Font tidak valid." };
  }

  if (font.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      font.premiumFeatureKey as FeatureKey
    );
    if (!allowed) {
      return { error: "Font ini butuh Premium." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileFont: fontKey },
  });

  revalidatePath("/dashboard/profile/appearance");
  revalidatePath("/[username]", "page");
  return { success: true };
}
