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

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Cari Media yang sudah menyimpan `url` ini, atau buat baris Media baru
 * kalau belum ada (kasus user paste URL eksternal langsung, bukan lewat
 * MediaUploadField). Memastikan setiap gambar yang dipakai project tetap
 * tercatat di Media Manager terpusat.
 */
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

export async function upsertProject(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const repoUrl = String(formData.get("repoUrl") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const coverUrl = String(formData.get("cover") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  const featured = formData.get("featured") === "on";

  if (!title) return { error: "Nama project wajib diisi." };
  if (!description) return { error: "Deskripsi wajib diisi." };

  for (const link of [repoUrl, url]) {
    if (link && !isSafeUrl(link)) {
      return { error: `URL tidak valid: ${link}` };
    }
  }

  const coverMediaId = coverUrl
    ? await resolveOrCreateMedia(coverUrl, session.user.id)
    : null;

  const data = {
    title,
    description: description || null,
    url: url || null,
    repoUrl: repoUrl || null,
    tags: parseTags(tagsRaw),
    status,
    coverMediaId,
    order,
    featured,
  };

  const project = id
    ? await prisma.project.update({ where: { id }, data })
    : await prisma.project.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Project",
      entityId: project.id,
      metadata: { title: project.title },
    },
  });

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: { title: true },
  });
  if (!existing) return { error: "Project tidak ditemukan." };

  await prisma.project.delete({ where: { id: projectId } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Project",
      entityId: projectId,
      metadata: { title: existing.title, deleted: true },
    },
  });

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true };
}

export async function reorderProjects(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true };
}

export async function addGalleryImage(
  projectId: string,
  url: string
): Promise<ActionResult & { id?: string }> {
  await verifyAdmin();

  const count = await prisma.projectImage.count({ where: { projectId } });

  const image = await prisma.projectImage.create({
    data: {
      projectId,
      url,
      order: count,
    },
  });

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true, id: image.id };
}

export async function removeGalleryImage(
  imageId: string
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.projectImage.delete({ where: { id: imageId } });

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true };
}

export async function reorderGalleryImages(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.projectImage.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/projects");
  revalidatePath("/");

  return { success: true };
}
