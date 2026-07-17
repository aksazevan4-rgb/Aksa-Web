"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { MAX_ALIASES_PER_USER } from "@/lib/alias-constants";

const ALIAS_RE = /^[a-z0-9_-]{3,20}$/;
const RESERVED = new Set([
  "dashboard", "api", "login", "register", "admin", "settings",
  "l", "og", "verify-email", "reset-password", "forgot-password",
  "confirm-email-change", "maintenance",
]);

export async function addAlias(rawAlias: string) {
  const session = await verifySession();

  const alias = rawAlias.trim().toLowerCase();

  if (!ALIAS_RE.test(alias)) {
    return { error: "Alias 3-20 karakter, hanya huruf kecil/angka/-/_." };
  }
  if (RESERVED.has(alias)) {
    return { error: "Alias ini dipakai sistem, coba yang lain." };
  }

  const existingCount = await prisma.profileAlias.count({
    where: { userId: session.user.id },
  });
  if (existingCount >= MAX_ALIASES_PER_USER) {
    return { error: `Maksimal ${MAX_ALIASES_PER_USER} alias per akun.` };
  }

  const [clashUsername, clashAlias] = await Promise.all([
    prisma.user.findUnique({ where: { username: alias }, select: { id: true } }),
    prisma.profileAlias.findUnique({ where: { alias }, select: { id: true } }),
  ]);
  if (clashUsername || clashAlias) {
    return { error: "Alias ini sudah dipakai." };
  }

  const created = await prisma.profileAlias.create({
    data: { userId: session.user.id, alias },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, id: created.id, alias: created.alias };
}

export async function removeAlias(id: string) {
  const session = await verifySession();

  const existing = await prisma.profileAlias.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    return { error: "Alias tidak ditemukan." };
  }

  await prisma.profileAlias.delete({ where: { id } });
  revalidatePath("/dashboard/profile");
  return { success: true };
}
