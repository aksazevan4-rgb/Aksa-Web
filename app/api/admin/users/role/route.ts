import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/dal";
import { AuditAction, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;
  const { session } = authResult;

  try {
    const { userId, role } = await req.json();

    if (!userId || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Tidak bisa mengubah role diri sendiri" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isFounder: true, email: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (target.isFounder) {
      return NextResponse.json(
        { error: "Role akun Founder tidak bisa diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    // Catat di audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.USER_ROLE_CHANGE,
        entityType: "User",
        entityId: userId,
        metadata: {
          previousRole: target.role,
          newRole: role,
          targetEmail: updated.email,
        },
      },
    });

    return NextResponse.json({ success: true, role: updated.role });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: "Gagal mengubah role" }, { status: 500 });
  }
}
