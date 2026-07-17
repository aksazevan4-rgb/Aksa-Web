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

export async function upsertTestimonial(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await verifyAdmin();

  const id = String(formData.get("id") ?? "").trim() || undefined;
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!name) return { error: "Nama wajib diisi." };
  if (!content) return { error: "Isi testimoni wajib diisi." };
  if (avatarUrl && !isSafeUrl(avatarUrl)) {
    return { error: "URL avatar tidak valid." };
  }

  const data = {
    name,
    role: role || null,
    content,
    avatarUrl: avatarUrl || null,
    order,
  };

  const testimonial = id
    ? await prisma.testimonial.update({ where: { id }, data })
    : await prisma.testimonial.create({ data });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Testimonial",
      entityId: testimonial.id,
      metadata: { name: testimonial.name },
    },
  });

  revalidatePath("/dashboard/admin/content/testimonials");
  revalidatePath("/");

  return { success: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const session = await verifyAdmin();

  const existing = await prisma.testimonial.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!existing) return { error: "Testimoni tidak ditemukan." };

  await prisma.testimonial.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Testimonial",
      entityId: id,
      metadata: { name: existing.name },
    },
  });

  revalidatePath("/dashboard/admin/content/testimonials");
  revalidatePath("/");

  return { success: true };
}

export async function reorderTestimonials(
  orderedIds: string[]
): Promise<ActionResult> {
  await verifyAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.testimonial.update({ where: { id }, data: { order: index } })
    )
  );

  revalidatePath("/dashboard/admin/content/testimonials");
  revalidatePath("/");

  return { success: true };
}
