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
  const existing = await prisma.media.findFirst({
    where: { url },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.media.create({
    data: {
      url,
      uploaderId,
      resourceType: "image",
      publicId: null,
      format: null,
      bytes: null,
      width: null,
      height: null,
    },
  });

  return created.id;
}

export async function updateAboutProfile(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const rolesRaw = String(formData.get("roles") ?? "");
  const founderOf = String(formData.get("founderOf") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const bioRaw = String(formData.get("bioParagraphs") ?? "");
  const avatarUrl = String(formData.get("avatar") ?? "").trim();

  if (!name) return { error: "Nama wajib diisi." };
  if (!role) return { error: "Role utama wajib diisi." };
  if (!location) return { error: "Lokasi wajib diisi." };
  if (!timezone) return { error: "Timezone wajib diisi." };
  if (!status) return { error: "Status wajib diisi." };

  const roles = rolesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (roles.length === 0) return { error: "Minimal satu role di daftar roles." };

  const bioParagraphs = bioRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (bioParagraphs.length === 0) {
    return { error: "Bio tidak boleh kosong." };
  }

  if (avatarUrl && !isSafeUrl(avatarUrl)) {
    return { error: "URL avatar tidak valid." };
  }

  const avatarMediaId = avatarUrl ? await resolveOrCreateMedia(avatarUrl, session.user.id) : null;

  await prisma.profile.upsert({
    where: { id: "profile" },
    create: {
      id: "profile",
      name,
      role,
      roles,
      founderOf: founderOf || null,
      location,
      timezone,
      status,
      bioParagraphs,
      avatarMediaId,
    },
    update: {
      name,
      role,
      roles,
      founderOf: founderOf || null,
      location,
      timezone,
      status,
      bioParagraphs,
      avatarMediaId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.PROFILE_UPDATE,
      entityType: "Profile",
      entityId: "profile",
      metadata: { name, role },
    },
  });

  revalidatePath("/dashboard/admin/content/about");
  revalidatePath("/");

  return { success: true };
}
