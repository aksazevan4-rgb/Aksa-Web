"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteGuestbookEntry(entryId: string) {
  const session = await verifySession();

  const existing = await prisma.guestbookEntry.findUnique({
    where: { id: entryId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { error: "Pesan tidak ditemukan." };
  }

  await prisma.guestbookEntry.delete({ where: { id: entryId } });

  revalidatePath("/dashboard/profile/widgets");
  const owner = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });
  if (owner?.username) revalidatePath(`/${owner.username}`);

  return { success: true };
}
