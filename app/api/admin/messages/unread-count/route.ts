import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await verifyAdminApi();
  if (authResult.response) return authResult.response;

  const messages = await prisma.message.findMany({
    where: {
      read: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      name: true,
      subject: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    messages: messages.map((m: (typeof messages)[number]) => ({
      id: m.id,
      name: m.name,
      subject: m.subject,
      createdAt: m.createdAt.toISOString(),
    })),
    unreadCount: messages.length,
  });
}