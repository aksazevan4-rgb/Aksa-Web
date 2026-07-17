"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SOCIAL_PLATFORMS } from "./data";
import { hasFeatureAccess, type FeatureKey } from "@/lib/premium-features";
import { PROFILE_THEMES } from "@/lib/profile-themes";

interface ActionState {
  success?: boolean;
  error?: string;
}

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const userId = session.user.id;

  const name = String(formData.get("name") ?? "").trim();
  const rawUsername = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const image = String(formData.get("image") ?? "").trim() || null;
  const bannerImage = String(formData.get("bannerImage") ?? "").trim() || null;
  const profileVisibility = String(formData.get("profileVisibility") ?? "PUBLIC");
  const profileTheme = String(formData.get("profileTheme") ?? "default");
  const accentColorRaw = String(formData.get("profileAccentColor") ?? "").trim();
  const discordIdRaw = String(formData.get("discordId") ?? "").trim();

  if (!name) return { error: "Nama tidak boleh kosong." };

  // Theme gate — was previously accepted with no server-side check at all,
  // meaning any user could set a premium theme (Neon/Cyber/Rose Gold) for
  // free just by knowing the key. Same pattern already used for layout/
  // border/background/font in app/dashboard/profile/appearance/actions.ts.
  const theme = PROFILE_THEMES.find((t) => t.key === profileTheme);
  if (!theme) return { error: "Tema tidak valid." };
  if (theme.premiumFeatureKey) {
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      theme.premiumFeatureKey as FeatureKey
    );
    if (!allowed) return { error: "Tema ini butuh Premium." };
  }

  // Accent color — free users can't set one at all (empty string is fine,
  // that's "use the theme's own color"); Premium can set any valid hex.
  let profileAccentColor: string | null = null;
  if (accentColorRaw) {
    if (!/^#[0-9a-fA-F]{6}$/.test(accentColorRaw)) {
      return { error: "Format warna aksen tidak valid (harus hex, mis. #9b6dff)." };
    }
    const allowed = await hasFeatureAccess(
      { plan: session.user.plan ?? "FREE", role: session.user.role },
      "custom_accent_color" as FeatureKey
    );
    if (!allowed) return { error: "Warna aksen custom butuh Premium." };
    profileAccentColor = accentColorRaw;
  }

  // Username validation
  let username: string | null = null;
  if (rawUsername) {
    if (!/^[a-z0-9_]{3,24}$/.test(rawUsername)) {
      return {
        error: "Username hanya boleh huruf kecil, angka, dan underscore (3-24 karakter).",
      };
    }

    const [existing, aliasClash] = await Promise.all([
      prisma.user.findFirst({
        where: { username: rawUsername, id: { not: userId } },
        select: { id: true },
      }),
      prisma.profileAlias.findUnique({
        where: { alias: rawUsername },
        select: { userId: true },
      }),
    ]);

    if (existing || (aliasClash && aliasClash.userId !== userId)) {
      return { error: "Username sudah dipakai. Coba username lain." };
    }

    username = rawUsername;
  }

  // Discord ID validation
  const discordAccount = await prisma.account.findFirst({
    where: { userId, provider: "discord" },
    select: { providerAccountId: true },
  });

  // Kalau Discord sudah terhubung lewat OAuth, ID itu otentik (diverifikasi
  // Discord sendiri) — jangan biarkan form ini menimpanya dengan input
  // manual apa pun, bahkan kalau seseorang memaksa lewat request langsung.
  const discordId = discordAccount
    ? discordAccount.providerAccountId
    : discordIdRaw && /^\d{17,20}$/.test(discordIdRaw)
      ? discordIdRaw
      : null;

  // Collect social links from form — builds flat JSON object.
  const socialLinks: Record<string, string> = {};
  for (const platform of SOCIAL_PLATFORMS) {
    const val = String(formData.get(`social_${platform.id}`) ?? "").trim();
    if (val) socialLinks[platform.id] = val;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        bio,
        image,
        bannerImage,
        profileVisibility: profileVisibility === "PRIVATE" ? "PRIVATE" : "PUBLIC",
        profileTheme,
        profileAccentColor,
        socialLinks,
        discordId,
        discordLinked: Boolean(discordId),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.PROFILE_UPDATE,
        entityType: "User",
        entityId: userId,
      },
    });
  } catch (err: unknown) {
    // P2002 = Prisma unique constraint violation
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "Username sudah dipakai." };
    }
    console.error("[PROFILE_UPDATE_ERROR]", err);
    return { error: "Gagal menyimpan profil. Coba lagi." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/[username]", "page");

  return { success: true };
}
