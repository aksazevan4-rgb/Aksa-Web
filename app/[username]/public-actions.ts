"use server";

import DOMPurify from "isomorphic-dompurify";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendEmail } from "@/lib/mail";
import { getSiteConfig } from "@/lib/site-config";

/**
 * app/[username]/public-actions.ts
 *
 * Server actions callable from PUBLIC (unauthenticated) visitor-facing
 * widgets on /[username] — Guestbook and Reactions. Unlike everything
 * under app/dashboard/*, these deliberately do NOT call verifySession():
 * the caller is an anonymous visitor, not the profile owner.
 *
 * Every action re-checks that the target profile actually has the widget
 * enabled + accessible (premium gate) server-side, never trusting that the
 * client only shows the form when it's supposed to.
 */

const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "👀"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

function stripTags(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}

async function getWidgetGate(userId: string, widgetKey: "guestbook" | "reactions") {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      role: true,
      widgetConfig: true,
      accountStatus: true,
      username: true,
      email: true,
      emailVerified: true,
      notifyGuestbookEmail: true,
    },
  });
  if (!dbUser || dbUser.accountStatus !== "ACTIVE") return null;

  const { resolveActiveWidgets } = await import("@/lib/widget-registry");
  const { getUserFeatures } = await import("@/lib/premium-features");
  const accessible = await getUserFeatures({ plan: dbUser.plan, role: dbUser.role });
  const active = resolveActiveWidgets(
    dbUser.widgetConfig as Parameters<typeof resolveActiveWidgets>[0],
    accessible
  );
  const enabled = active.some((w) => w.key === widgetKey);
  return enabled ? dbUser : null;
}

export async function postGuestbookMessage(
  userId: string,
  rawName: string,
  rawMessage: string
): Promise<{ error?: string; success?: boolean }> {
  const gate = await getWidgetGate(userId, "guestbook");
  if (!gate) return { error: "Guestbook tidak aktif di profil ini." };

  const name = stripTags(rawName).slice(0, 40);
  const message = stripTags(rawMessage).slice(0, 280);

  if (!name) return { error: "Nama tidak boleh kosong." };
  if (!message) return { error: "Pesan tidak boleh kosong." };

  // Lightweight spam guard: same name can't post twice within 30s on the
  // same profile. Not foolproof (no auth to key off), but stops the
  // trivial "spam the submit button" case without needing IP tracking.
  const recent = await prisma.guestbookEntry.findFirst({
    where: {
      userId,
      name,
      createdAt: { gte: new Date(Date.now() - 30_000) },
    },
  });
  if (recent) {
    return { error: "Tunggu sebentar sebelum mengirim pesan lagi." };
  }

  await prisma.guestbookEntry.create({ data: { userId, name, message } });

  await createNotification({
    userId,
    type: "guestbook",
    title: "Pesan baru di Guestbook",
    body: `${name}: ${message.slice(0, 80)}${message.length > 80 ? "…" : ""}`,
    link: "/dashboard/profile/widgets",
  });

  if (gate.notifyGuestbookEmail && gate.email && gate.emailVerified) {
    const config = await getSiteConfig();
    sendEmail({
      to: gate.email,
      subject: `Pesan Guestbook baru dari ${name}`,
      html: `<p><strong>${name}</strong> menulis di guestbook profilmu:</p><p>${message}</p><p><a href="${config.siteUrl}/dashboard/profile/widgets">Buka Guestbook</a></p>`,
      text: `${name} menulis: ${message}`,
    }).catch((error) => console.error("[GUESTBOOK_EMAIL_ERROR]", error));
  }

  if (gate.username) revalidatePath(`/${gate.username}`);
  return { success: true };
}

export async function reactToProfile(
  userId: string,
  emoji: string
): Promise<{ error?: string; counts?: Record<string, number> }> {
  if (!REACTION_EMOJIS.includes(emoji as ReactionEmoji)) {
    return { error: "Reaksi tidak valid." };
  }

  const gate = await getWidgetGate(userId, "reactions");
  if (!gate) return { error: "Reactions tidak aktif di profil ini." };

  await prisma.profileReaction.upsert({
    where: { userId_emoji: { userId, emoji } },
    update: { count: { increment: 1 } },
    create: { userId, emoji, count: 1 },
  });

  const all = await prisma.profileReaction.findMany({ where: { userId } });
  const counts: Record<string, number> = {};
  for (const r of all) counts[r.emoji] = r.count;

  if (gate.username) revalidatePath(`/${gate.username}`);
  return { counts };
}
