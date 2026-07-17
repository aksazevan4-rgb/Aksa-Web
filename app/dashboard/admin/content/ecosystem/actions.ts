"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";

interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function upsertEcosystemNode(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "active").trim();
  const urlRaw = String(formData.get("url") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!name) return { error: "Nama node wajib diisi." };

  const data = {
    name,
    description: description || null,
    status,
    url: urlRaw || null,
    order,
  };

  const node = id
    ? await prisma.ecosystemNode.update({ where: { id }, data })
    : await prisma.ecosystemNode.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "EcosystemNode",
      entityId: node.id,
      metadata: {
        operation: id ? "update" : "create",
        name: node.name,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/ecosystem");
  revalidatePath("/");

  return { success: true };
}

export async function deleteEcosystemNode(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.ecosystemNode.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!existing) return { error: "Node tidak ditemukan." };

  await prisma.ecosystemNode.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "EcosystemNode",
      entityId: id,
      metadata: {
        operation: "delete",
        name: existing.name,
      },
    },
  });

  revalidatePath("/dashboard/admin/content/ecosystem");
  revalidatePath("/");

  return { success: true };
}

export async function reorderEcosystemNodes(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.ecosystemNode.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/ecosystem");
  revalidatePath("/");

  return { success: true };
}
