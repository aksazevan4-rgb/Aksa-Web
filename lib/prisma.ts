import { PrismaClient } from "@prisma/client";

// Mencegah Next.js membuat banyak instance PrismaClient saat hot-reload
// di development (setiap edit file akan re-run module-level code).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
