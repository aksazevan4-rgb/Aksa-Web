"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertStat(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const label = String(formData.get("label") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!label) return { error: "Label wajib diisi." };
  if (!value) return { error: "Value wajib diisi." };

  const data = { label, value, order };

  const stat = id
    ? await prisma.stat.update({ where: { id }, data })
    : await prisma.stat.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Stat",
      entityId: stat.id,
      metadata: { label: stat.label },
    },
  });

  revalidatePath("/dashboard/admin/content/stats");
  revalidatePath("/");

  return { success: true };
}

export async function deleteStat(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.stat.findUnique({
    where: { id },
    select: { label: true },
  });
  if (!existing) return { error: "Stat tidak ditemukan." };

  await prisma.stat.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Stat",
      entityId: id,
      metadata: { label: existing.label },
    },
  });

  revalidatePath("/dashboard/admin/content/stats");
  revalidatePath("/");

  return { success: true };
}

export async function reorderStats(orderedIds: string[]): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.stat.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/stats");
  revalidatePath("/");

  return { success: true };
}
