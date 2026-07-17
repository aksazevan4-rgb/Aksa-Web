"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertService(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!title) return { error: "Nama layanan wajib diisi." };
  if (!description) return { error: "Deskripsi wajib diisi." };

  const data = { title, description, icon: icon || null, order };

  const service = id
    ? await prisma.service.update({ where: { id }, data })
    : await prisma.service.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Service",
      entityId: service.id,
      metadata: { title: service.title },
    },
  });

  revalidatePath("/dashboard/admin/content/services");
  revalidatePath("/");

  return { success: true };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.service.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!existing) return { error: "Layanan tidak ditemukan." };

  await prisma.service.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Service",
      entityId: id,
      metadata: { title: existing.title },
    },
  });

  revalidatePath("/dashboard/admin/content/services");
  revalidatePath("/");

  return { success: true };
}

export async function reorderServices(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/services");
  revalidatePath("/");

  return { success: true };
}
