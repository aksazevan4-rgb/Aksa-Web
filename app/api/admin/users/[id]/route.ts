import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/dal";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizeName, sanitizeBio, getUsernameError } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;
  const { session } = authResult;

  const { id } = await params;

  try {
    const body = await req.json();
    const name = sanitizeName(String(body.name ?? ""));
    const usernameRaw = String(body.username ?? "").trim();
    const bio = sanitizeBio(String(body.bio ?? ""));

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    let username: string | null = null;
    if (usernameRaw) {
      const usernameError = getUsernameError(usernameRaw);
      if (usernameError) {
        return NextResponse.json({ error: usernameError }, { status: 400 });
      }
      username = usernameRaw.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "Username ini sudah dipakai user lain" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { name, username, bio: bio || null },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.USER_UPDATE,
        entityType: "User",
        entityId: id,
        metadata: { targetEmail: updated.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin edit user error:", error);
    return NextResponse.json({ error: "Gagal menyimpan perubahan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;
  const { session } = authResult;

  const { id } = await params;

  // Jangan izinkan admin menghapus dirinya sendiri
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, isFounder: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    if (user.isFounder) {
      return NextResponse.json(
        { error: "Akun Founder tidak bisa dihapus" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    // Catat di audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: AuditAction.USER_DELETE,
        entityType: "User",
        entityId: id,
        metadata: { deletedEmail: user.email, deletedName: user.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
