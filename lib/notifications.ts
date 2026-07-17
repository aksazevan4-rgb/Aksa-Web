import { prisma } from "@/lib/prisma";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
      },
    });
  } catch (error) {
    // Notifications are best-effort — never let a failure here break the
    // action that triggered it (e.g. a visitor's guestbook post).
    console.error("[NOTIFICATION_CREATE_ERROR]", error);
  }
}
