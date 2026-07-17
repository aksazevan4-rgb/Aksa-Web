import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * app/api/health/route.ts
 * docs/17-testing-deployment.md §7 — dipakai load balancer/orchestrator
 * untuk deteksi instance yang tidak sehat. Sengaja ringan: satu query
 * trivial ke DB (bukan agregasi berat) supaya health check sendiri tidak
 * jadi beban tambahan di production.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[HEALTH_CHECK_ERROR]", error);
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
