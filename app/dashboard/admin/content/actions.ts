"use server";

import { revalidatePath } from "next/cache";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/dal";
export async function updateMessageStatus(
  messageId: string,
  read: boolean
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifyAdmin();

  const existing = await prisma.message.findUnique({
    where: { id: messageId },
    select: { read: true },
  });

  if (!existing) {
    return { error: "Pesan tidak ditemukan." };
  }

  await prisma.message.update({
    where: { id: messageId },
    data: {
      read,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Message",
      entityId: messageId,
      metadata: {
        previousRead: existing.read,
        newRead: read,
      },
    },
  });

  revalidatePath("/dashboard/admin/content");

  return {
    success: true,
  };
}

export async function deleteMessage(
  messageId: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifyAdmin();

  const existing = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      subject: true,
      email: true,
    },
  });

  if (!existing) {
    return {
      error: "Pesan tidak ditemukan.",
    };
  }

  await prisma.message.delete({
    where: {
      id: messageId,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: AuditAction.CONTENT_UPDATE,
      entityType: "Message",
      entityId: messageId,
      metadata: {
        subject: existing.subject,
        email: existing.email,
        deleted: true,
      },
    },
  });

  revalidatePath("/dashboard/admin/content");
  return {
    success: true,
  };
}