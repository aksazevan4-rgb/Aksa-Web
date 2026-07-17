"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

export async function markNotificationRead(id: string) {
  const session = await verifySession();

  const notif = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!notif || notif.userId !== session.user.id) {
    return { error: "Notifikasi tidak ditemukan." };
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await verifySession();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/dashboard");
  return { success: true };
}
