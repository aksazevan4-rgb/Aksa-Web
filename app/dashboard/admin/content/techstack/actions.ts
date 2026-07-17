"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertTechStackItem(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!name) return { error: "Nama tech wajib diisi." };

  const existingName = await prisma.techItem.findFirst({ where: { name } });
  if (existingName && existingName.id !== id) {
    return { error: "Nama tech ini sudah ada." };
  }

  const data = {
    name,
    category: category || null,
    icon: icon || null,
    order,
  };

  const item = id
    ? await prisma.techItem.update({ where: { id }, data })
    : await prisma.techItem.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "TechItem",
      entityId: item.id,
      metadata: { name: item.name },
    },
  });

  revalidatePath("/dashboard/admin/content/techstack");
  revalidatePath("/");

  return { success: true };
}

export async function deleteTechStackItem(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.techItem.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!existing) return { error: "Item tidak ditemukan." };

  await prisma.techItem.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "TechItem",
      entityId: id,
      metadata: { name: existing.name },
    },
  });

  revalidatePath("/dashboard/admin/content/techstack");
  revalidatePath("/");

  return { success: true };
}

export async function reorderTechStackItems(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.techItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/techstack");
  revalidatePath("/");

  return { success: true };
}
