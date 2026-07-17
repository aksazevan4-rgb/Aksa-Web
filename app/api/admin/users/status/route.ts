import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/dal";
import { AuditAction, AccountStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["ACTIVE", "SUSPENDED", "BANNED"];

export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;
  const { session } = authResult;

  try {
    const { userId, status } = await req.json();

    if (!userId || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // Jangan izinkan admin mengubah status dirinya sendiri — supaya tidak
    // bisa tidak sengaja mengunci diri sendiri keluar dari akun admin.
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Tidak bisa mengubah status akun sendiri" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountStatus: true, email: true, isFounder: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (target.isFounder && status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Status akun Founder tidak bisa diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status as AccountStatus },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.USER_STATUS_CHANGE,
        entityType: "User",
        entityId: userId,
        metadata: {
          previousStatus: target.accountStatus,
          newStatus: status,
          targetEmail: target.email,
        },
      },
    });

    return NextResponse.json({ success: true, status: updated.accountStatus });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Gagal mengubah status" }, { status: 500 });
  }
}
