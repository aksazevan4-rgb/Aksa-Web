"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertExperience(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const role = String(formData.get("role") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);
  const current = formData.get("current") === "on";

  if (!role) return { error: "Peran/jabatan wajib diisi." };
  if (!company) return { error: "Perusahaan/organisasi wajib diisi." };
  if (!description) return { error: "Deskripsi wajib diisi." };
  if (!startDate) return { error: "Tanggal mulai wajib diisi." };

  const endDate = current ? null : endDateRaw || null;

  const data = {
    role,
    company,
    startDate,
    endDate,
    description,
    order,
    current,
  };

  const entry = id
    ? await prisma.experience.update({ where: { id }, data })
    : await prisma.experience.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Experience",
      entityId: entry.id,
      metadata: {
        operation: id ? "update" : "create",
        role: entry.role,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/experience");
  revalidatePath("/");

  return { success: true };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.experience.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!existing) return { error: "Entri tidak ditemukan." };

  await prisma.experience.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Experience",
      entityId: id,
      metadata: {
        operation: "delete",
        role: existing.role,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/experience");
  revalidatePath("/");

  return { success: true };
}

export async function reorderExperience(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.experience.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/experience");
  revalidatePath("/");

  return { success: true };
}
