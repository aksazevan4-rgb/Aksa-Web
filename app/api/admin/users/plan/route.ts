import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/dal";
import { AuditAction, Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;
  const { session } = authResult;

  try {
    const { userId, plan } = await req.json();

    if (!userId || !["FREE", "PREMIUM"].includes(plan)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan as Plan,
        premiumSince:
          plan === "PREMIUM" && target.plan !== "PREMIUM"
            ? new Date()
            : plan === "FREE"
              ? null
              : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.USER_PLAN_CHANGE,
        entityType: "User",
        entityId: userId,
        metadata: {
          previousPlan: target.plan,
          newPlan: plan,
          targetEmail: target.email,
        },
      },
    });

    return NextResponse.json({ success: true, plan: updated.plan });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Gagal mengubah plan" }, { status: 500 });
  }
}
