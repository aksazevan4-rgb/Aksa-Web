"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertFocusItem(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!title) return { error: "Judul wajib diisi." };
  if (!description) return { error: "Deskripsi wajib diisi." };

  const data = { title, description, icon: icon || null, order };

  const item = id
    ? await prisma.focusItem.update({ where: { id }, data })
    : await prisma.focusItem.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "FocusItem",
      entityId: item.id,
      metadata: {
        operation: id ? "update" : "create",
        title: item.title,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/focus");
  revalidatePath("/");

  return { success: true };
}

export async function deleteFocusItem(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.focusItem.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!existing) return { error: "Item tidak ditemukan." };

  await prisma.focusItem.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "FocusItem",
      entityId: id,
      metadata: {
        operation: "delete",
        title: existing.title,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/focus");
  revalidatePath("/");

  return { success: true };
}

export async function reorderFocusItems(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.focusItem.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/focus");
  revalidatePath("/");

  return { success: true };
}
